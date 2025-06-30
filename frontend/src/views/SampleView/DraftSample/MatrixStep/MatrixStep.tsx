import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import {
  StageLabels,
  StagesByProgrammingPlanKind
} from 'maestro-shared/referential/Stage';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { SampleDocumentTypeList } from 'maestro-shared/schema/File/FileType';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { PFASKindList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  isCreatedPartialSample,
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleMatrixData,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SupportDocumentDownload from 'src/views/SampleView/DraftSample/SupportDocumentDownload';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import { z } from 'zod/v4';
import AppServiceErrorAlert from '../../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import { selectOptionsFromList } from '../../../../components/_app/AppSelect/AppSelectOption';
import AppUpload from '../../../../components/_app/AppUpload/AppUpload';
import SampleDocument from '../../../../components/SampleDocument/SampleDocument';
import { useAnalytics } from '../../../../hooks/useAnalytics';
import { usePartialSample } from '../../../../hooks/usePartialSample';
import { ApiClientContext } from '../../../../services/apiClient';
import NextButton from '../NextButton';
import MatrixStepPFAS, { PartialSamplePFAS } from './MatrixStepPFAS';
import MatrixStepPPV, { PartialSamplePPV } from './MatrixStepPPV';

export type MatrixStepRef = {
  submit: () => Promise<void>;
};

type Props = {
  partialSample: PartialSample | PartialSampleToCreate;
};

const MatrixStep = ({ partialSample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();
  const { user } = useAuthentication();
  const { readonly } = usePartialSample(partialSample);
  const { trackEvent } = useAnalytics();

  const stepRef = useRef<MatrixStepRef>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const [files, setFiles] = useState<File[]>([]);
  const [documentIds, setDocumentIds] = useState(partialSample.documentIds);
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdateSample, createOrUpdateSampleCall] =
    apiClient.useCreateOrUpdateSampleMutation();
  const [createDocument] = apiClient.useCreateDocumentMutation();
  const [deleteDocument] = apiClient.useDeleteDocumentMutation();
  const [getPrescriptionSubstances] =
    apiClient.useLazyGetPrescriptionSubstancesQuery();

  const { data: prescriptionsData } = apiClient.useFindPrescriptionsQuery(
    {
      programmingPlanId: partialSample.programmingPlanId as string,
      context: ProgrammingPlanContext.safeParse(partialSample.context).data
    },
    {
      skip: !partialSample.programmingPlanId
    }
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindRegionalPrescriptionsQuery(
      {
        programmingPlanId: partialSample.programmingPlanId as string,
        context: ProgrammingPlanContext.safeParse(partialSample.context).data,
        region: isCreatedPartialSample(partialSample)
          ? partialSample.region
          : user?.region
      },
      {
        skip: !partialSample.programmingPlanId
      }
    );

  const prescriptions = useMemo(() => {
    return prescriptionsData?.filter((p) =>
      regionalPrescriptions?.find((rp) => rp.prescriptionId === p.id)
    );
  }, [prescriptionsData, regionalPrescriptions]);

  const FilesForm = z.object({
    files: FileInput(SampleDocumentTypeList, true)
  });

  useEffect(
    () => {
      if (isSubmittingRef.current && !createOrUpdateSampleCall.isLoading) {
        isSubmittingRef.current = false;

        if (createOrUpdateSampleCall.isSuccess) {
          trackEvent(
            'sample',
            `submit_${partialSample.status}`,
            partialSample.id
          );
          navigateToSample(partialSample.id, 3);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      createOrUpdateSampleCall.isSuccess,
      createOrUpdateSampleCall.isLoading,
      partialSample.id
    ]
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (stepRef.current) {
      await stepRef.current.submit();
    }
  };

  const save = async (
    status: SampleStatus = partialSample.status,
    sampleMatrixData: Omit<
      PartialSampleMatrixData,
      'documentIds' | 'laboratoryId'
    > = PartialSampleMatrixData.parse(partialSample)
  ) => {
    const prescription = prescriptions?.find(
      (p) =>
        p.programmingPlanKind ===
          partialSample.specificData.programmingPlanKind &&
        p.matrixKind === sampleMatrixData.matrixKind &&
        sampleMatrixData.stage &&
        p.stages.includes(sampleMatrixData.stage)
    );
    const regionalPrescription = regionalPrescriptions?.find(
      (rp) => rp.prescriptionId === prescription?.id
    );

    const prescriptionSubstances = await (prescription
      ? getPrescriptionSubstances(prescription.id).unwrap()
      : undefined);

    await createOrUpdateSample({
      ...partialSample,
      ...sampleMatrixData,
      documentIds,
      status,
      prescriptionId: prescription?.id || null,
      laboratoryId: regionalPrescription?.laboratoryId || null,
      monoSubstances:
        prescriptionSubstances
          ?.filter((substance) => substance.analysisMethod === 'Mono')
          .map((_) => _.substance) ?? sampleMatrixData.monoSubstances,
      multiSubstances:
        prescriptionSubstances
          ?.filter((substance) => substance.analysisMethod === 'Multi')
          .map((_) => _.substance) ?? sampleMatrixData.multiSubstances
    });
  };

  const selectFiles = async () => {
    await filesForm.validate(async () => {
      const newDocumentIds = await Promise.all(
        files.map(async (file) => {
          const document = await createDocument({
            file,
            kind: 'SampleDocument'
          }).unwrap();

          return document.id;
        })
      );

      setDocumentIds([...(documentIds ?? []), ...newDocumentIds]);
      filesForm.reset();
    });
  };

  const filesForm = useForm(
    FilesForm,
    {
      files
    },
    selectFiles
  );

  const removeDocument = async (documentId: string) => {
    await deleteDocument(documentId);
    setDocumentIds((documentIds ?? []).filter((id) => id !== documentId));
  };

  const renderSampleAttachments = useMemo(
    () => () => (
      <>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <span className={cx('fr-text--md', 'fr-text--bold')}>
              Compléments
            </span>
            <AppUpload
              label="Pièces jointes"
              hint="Ajoutez si besoin un document ou une photo pour accompagner votre prélèvement JPG, PNG, PDF (10Mo maximum)"
              nativeInputProps={{
                onChange: (event: any) =>
                  setFiles(Array.from(event.target.files))
              }}
              className={cx('fr-mb-2w')}
              inputForm={filesForm}
              inputKey="files"
              acceptFileTypes={[...SampleDocumentTypeList]}
              whenValid="fichiers valides"
              multiple
              withPhoto={true}
            />
          </div>
        </div>

        {documentIds?.map((documentId) => (
          <SampleDocument
            key={`document-${documentId}`}
            documentId={documentId}
            onRemove={removeDocument}
          />
        ))}
      </>
    ),
    [documentIds, filesForm] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const matrixKindOptions = useMemo(
    () =>
      selectOptionsFromList(
        isProgrammingPlanSample(partialSample)
          ? MatrixKindList.filter((matrixKind) =>
              prescriptions?.some(
                (p) =>
                  p.programmingPlanKind ===
                    partialSample.specificData.programmingPlanKind &&
                  p.matrixKind === matrixKind
              )
            )
          : MatrixKindList.filter(
              (matrixKind) =>
                !prescriptions?.some(
                  (p) =>
                    p.programmingPlanKind ===
                      partialSample.specificData.programmingPlanKind &&
                    p.matrixKind === matrixKind
                )
            ),
        {
          labels: MatrixKindLabels,
          withSort: true,
          withDefault: false
        }
      ),
    [prescriptions, partialSample]
  );

  const stageOptions = useMemo(
    () =>
      selectOptionsFromList(
        StagesByProgrammingPlanKind[
          partialSample.specificData.programmingPlanKind
        ].filter(
          (stage) =>
            !isProgrammingPlanSample(partialSample) ||
            prescriptions?.find(
              (p) =>
                p.programmingPlanKind ===
                  partialSample.specificData.programmingPlanKind &&
                p.matrixKind === partialSample.matrixKind &&
                p.stages.includes(stage)
            )
        ),
        {
          labels: StageLabels,
          defaultLabel: 'Sélectionner un stade'
        }
      ),
    [partialSample, prescriptions]
  );

  return (
    <form data-testid="draft_sample_matrix_form" className="sample-form">
      <AppRequiredText />

      {partialSample.specificData.programmingPlanKind === 'PPV' && (
        <MatrixStepPPV
          ref={stepRef}
          partialSample={partialSample as PartialSamplePPV}
          matrixKindOptions={matrixKindOptions}
          stageOptions={stageOptions}
          onSave={(sampleMatrixData) => save('DraftMatrix', sampleMatrixData)}
          onSubmit={async () => {
            isSubmittingRef.current = true;
            await save('DraftItems');
          }}
          renderSampleAttachments={renderSampleAttachments}
        />
      )}

      {PFASKindList.includes(
        partialSample.specificData.programmingPlanKind
      ) && (
        <MatrixStepPFAS
          ref={stepRef}
          partialSample={partialSample as PartialSamplePFAS}
          matrixKindOptions={matrixKindOptions}
          stageOptions={stageOptions}
          onSave={(sampleMatrixData) => save('DraftMatrix', sampleMatrixData)}
          onSubmit={async () => {
            isSubmittingRef.current = true;
            await save('DraftItems');
          }}
          renderSampleAttachments={renderSampleAttachments}
        />
      )}

      <hr className={cx('fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={clsx(cx('fr-col-12'), 'sample-actions')}>
          <AppServiceErrorAlert call={createOrUpdateSampleCall} />
          <ul
            className={cx(
              'fr-btns-group',
              'fr-btns-group--inline-md',
              'fr-btns-group--between',
              'fr-btns-group--icon-left'
            )}
          >
            <li>
              <ButtonsGroup
                alignment="left"
                inlineLayoutWhen="md and up"
                buttons={
                  !readonly
                    ? [
                        PreviousButton({
                          sampleId: partialSample.id,
                          onSave: () => save('Draft'),
                          currentStep: 2
                        }),
                        {
                          children: 'Enregistrer en brouillon',
                          iconId: 'fr-icon-save-line',
                          priority: 'tertiary',
                          onClick: async (e: React.MouseEvent<HTMLElement>) => {
                            e.preventDefault();
                            await save();
                            setIsSaved(true);
                          },
                          nativeButtonProps: {
                            'data-testid': 'save-button'
                          }
                        }
                      ]
                    : [
                        PreviousButton({
                          sampleId: partialSample.id,
                          currentStep: 2
                        })
                      ]
                }
              />
            </li>
            <li>
              {!readonly ? (
                <Button
                  children="Continuer"
                  onClick={submit}
                  iconId="fr-icon-arrow-right-line"
                  iconPosition="right"
                  data-testid="submit-button"
                />
              ) : (
                <NextButton partialSample={partialSample} currentStep={2} />
              )}
            </li>
          </ul>
        </div>
        {isCreatedPartialSample(partialSample) && !readonly && (
          <SupportDocumentDownload partialSample={partialSample} />
        )}
      </div>
      <SavedAlert isOpen={isSaved} isDraft />
    </form>
  );
};

export default MatrixStep;
