import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { SampleDocumentTypeList } from 'maestro-shared/schema/File/FileType';
<<<<<<< HEAD
import { Context } from 'maestro-shared/schema/ProgrammingPlan/Context';
=======
import { PFASKindList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
>>>>>>> 66e0d2a9 (Introduction des types de plans dans un plan de programmation)
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
  SampleMatrixData
} from 'maestro-shared/schema/Sample/Sample';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import React, { useContext, useMemo, useRef, useState } from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SupportDocumentDownload from 'src/views/SampleView/DraftSample/SupportDocumentDownload';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import { z } from 'zod';
import AppUpload from '../../../../components/_app/AppUpload/AppUpload';
import SampleDocument from '../../../../components/SampleDocument/SampleDocument';
import { ApiClientContext } from '../../../../services/apiClient';
import MatrixStepPFAS, { PartialSamplePFAS } from './MatrixStepPFAS';
import MatrixStepPPV, { PartialSamplePPV } from './MatrixStepPPV';

export type MatrixStepRef = {
  submit: () => Promise<void>;
};

export interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

const MatrixStep = ({ partialSample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();
  const { user, hasUserPermission } = useAuthentication();

  const [matrixKind, setMatrixKind] = useState(partialSample.matrixKind);
  const [matrix, setMatrix] = useState(partialSample.matrix);

  const [matrixDetails, setMatrixDetails] = useState(
    getPartialSampleSpecificDataField(partialSample, 'PPV', 'matrixDetails')
  );
  const [matrixPart, setMatrixPart] = useState(
    getPartialSampleSpecificDataField(partialSample, 'PPV', 'matrixPart')
  );
  const [stage, setStage] = useState(
    getPartialSampleSpecificDataField(partialSample, 'PPV', 'stage') ||
      getPartialSampleSpecificDataField(partialSample, 'PFAS_EGGS', 'stage')
  );
  const [cultureKind, setCultureKind] = useState(
    getPartialSampleSpecificDataField(partialSample, 'PPV', 'cultureKind')
  );
  const [releaseControl, setReleaseControl] = useState(
    getPartialSampleSpecificDataField(partialSample, 'PPV', 'releaseControl')
  );

  const [species, setSpecies] = useState(
    getPartialSampleSpecificDataField(partialSample, 'PFAS_EGGS', 'species') ||
      getPartialSampleSpecificDataField(partialSample, 'PFAS_MEAT', 'species')
  );

  // const [killingCode, setKillingCode] = useState(
  //   getPartialSampleSpecificDataField(partialSample, 'PFAS_MEAT', 'killingCode')
  // );
  //
  // const [targetingCriteria, setTargetingCriteria] = useState(
  //   getPartialSampleSpecificDataField(
  //     partialSample,
  //     'PFAS_EGGS',
  //     'targetingCriteria'
  //   ) ||
  //     getPartialSampleSpecificDataField(
  //       partialSample,
  //       'PFAS_MEAT',
  //       'targetingCriteria'
  //     )
  // );
  // const [notesOnTargetingCriteria, setNotesOnTargetingCriteria] = useState(
  //   getPartialSampleSpecificDataField(
  //     partialSample,
  //     'PFAS_EGGS',
  //     'notesOnTargetingCriteria'
  //   ) ||
  //     getPartialSampleSpecificDataField(
  //       partialSample,
  //       'PFAS_MEAT',
  //       'notesOnTargetingCriteria'
  //     )
  // );
  // const [animalKind, setAnimalKind] = useState(
  //   getPartialSampleSpecificDataField(
  //     partialSample,
  //     'PFAS_EGGS',
  //     'animalKind'
  //   ) ||
  //     getPartialSampleSpecificDataField(
  //       partialSample,
  //       'PFAS_MEAT',
  //       'animalKind'
  //     )
  // );
  // const [productionKind, setProductionKind] = useState(
  //   getPartialSampleSpecificDataField(
  //     partialSample,
  //     'PFAS_EGGS',
  //     'productionKind'
  //   ) ||
  //     getPartialSampleSpecificDataField(
  //       partialSample,
  //       'PFAS_MEAT',
  //       'productionKind'
  //     )
  // );
  // const [identifier, setIdentifier] = useState(
  //   getPartialSampleSpecificDataField(
  //     partialSample,
  //     'PFAS_EGGS',
  //     'identifier'
  //   ) ||
  //     getPartialSampleSpecificDataField(
  //       partialSample,
  //       'PFAS_MEAT',
  //       'identifier'
  //     )
  // );
  // const [breedingMethod, setBreedingMethod] = useState(
  //   getPartialSampleSpecificDataField(
  //     partialSample,
  //     'PFAS_EGGS',
  //     'breedingMethod'
  //   ) ||
  //     getPartialSampleSpecificDataField(
  //       partialSample,
  //       'PFAS_MEAT',
  //       'breedingMethod'
  //     )
  // );
  // const [age, setAge] = useState(
  //   getPartialSampleSpecificDataField(partialSample, 'PFAS_EGGS', 'age') ||
  //     getPartialSampleSpecificDataField(partialSample, 'PFAS_MEAT', 'age')
  // );
  // const [sex, setSex] = useState(
  //   getPartialSampleSpecificDataField(partialSample, 'PFAS_EGGS', 'sex') ||
  //     getPartialSampleSpecificDataField(partialSample, 'PFAS_MEAT', 'sex')
  // );
  // const [seizure, setSeizure] = useState(
  //   getPartialSampleSpecificDataField(partialSample, 'PFAS_EGGS', 'seizure') ||
  //     getPartialSampleSpecificDataField(partialSample, 'PFAS_MEAT', 'seizure')
  // );
  // const [outdoorAccess, setOutdoorAccess] = useState(
  //   getPartialSampleSpecificDataField(
  //     partialSample,
  //     'PFAS_EGGS',
  //     'outdoorAccess'
  //   ) ||
  //     getPartialSampleSpecificDataField(
  //       partialSample,
  //       'PFAS_MEAT',
  //       'outdoorAccess'
  //     )
  // );
  const stepRef = useRef<MatrixStepRef>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [documentIds, setDocumentIds] = useState(partialSample.documentIds);
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdate] = apiClient.useCreateOrUpdateSampleMutation();
  const [createDocument] = apiClient.useCreateDocumentMutation();
  const [deleteDocument] = apiClient.useDeleteDocumentMutation();

  const { data: prescriptionsData } = apiClient.useFindPrescriptionsQuery(
    {
      programmingPlanId: partialSample.programmingPlanId as string,
      context: partialSample.context as Context
    },
    {
      skip: !partialSample.programmingPlanId || !partialSample.context
    }
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindRegionalPrescriptionsQuery(
      {
        programmingPlanId: partialSample.programmingPlanId as string,
        context: partialSample.context as Context,
        region: isCreatedPartialSample(partialSample)
          ? partialSample.region
          : user?.region
      },
      {
        skip: !partialSample.programmingPlanId || !partialSample.context
      }
    );

  const prescriptions = useMemo(() => {
    return prescriptionsData?.filter((p) =>
      regionalPrescriptions?.find((rp) => rp.prescriptionId === p.id)
    );
  }, [prescriptionsData, regionalPrescriptions]);

  type FilesFormShape = typeof FilesForm.shape;

  const FilesForm = z.object({
    files: FileInput(SampleDocumentTypeList, true)
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (stepRef.current) {
      await stepRef.current.submit();
    }
  };

  const save = async (
    status: SampleStatus,
    sampleMatrixData: Omit<
      SampleMatrixData,
      'documentIds' | 'laboratoryId'
    > = SampleMatrixData.parse(partialSample)
  ) => {
    const regionalPrescription = regionalPrescriptions?.find(
      (rp) =>
        rp.prescriptionId ===
        (sampleMatrixData.prescriptionId ?? partialSample.prescriptionId)
    );

    await createOrUpdate({
      ...partialSample,
      ...sampleMatrixData,
      documentIds,
      status,
      laboratoryId:
        regionalPrescription?.laboratoryId ?? partialSample.laboratoryId
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
            <AppUpload<FilesFormShape>
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

  return (
    <form data-testid="draft_sample_matrix_form" className="sample-form">
      <AppRequiredText />

      {partialSample.specificData.programmingPlanKind === 'PPV' && (
        <MatrixStepPPV
          ref={stepRef}
          partialSample={partialSample as PartialSamplePPV}
          prescriptions={prescriptions ?? []}
          onSave={(sampleMatrixData) => save('DraftMatrix', sampleMatrixData)}
          onSubmit={async () => {
            await save('DraftItems');
            navigateToSample(partialSample.id, 3);
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
          prescriptions={prescriptions ?? []}
          onSave={(sampleMatrixData) => save('DraftMatrix', sampleMatrixData)}
          onSubmit={async () => {
            await save('DraftItems');
            navigateToSample(partialSample.id, 3);
          }}
          renderSampleAttachments={renderSampleAttachments}
        />
      )}

      <hr className={cx('fr-mx-0')} />
      {hasUserPermission('updateSample') && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={clsx(cx('fr-col-12'), 'sample-actions')}>
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
                    [
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
                          await save('DraftMatrix');
                          setIsSaved(true);
                        },
                        nativeButtonProps: {
                          'data-testid': 'save-button'
                        }
                      }
                    ] as any
                  }
                />
              </li>
              <li>
                <Button
                  children="Continuer"
                  onClick={submit}
                  iconId="fr-icon-arrow-right-line"
                  iconPosition="right"
                  data-testid="submit-button"
                />
              </li>
            </ul>
          </div>
          {isCreatedPartialSample(partialSample) && (
            <SupportDocumentDownload partialSample={partialSample} />
          )}
        </div>
      )}
      <SavedAlert isOpen={isSaved} isDraft />
    </form>
  );
};

export default MatrixStep;
