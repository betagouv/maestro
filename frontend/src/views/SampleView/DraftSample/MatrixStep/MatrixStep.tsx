import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList,
  OtherMatrixKind
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  Stage,
  StageLabels,
  StagesByProgrammingPlanKind
} from 'maestro-shared/referential/Stage';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { SampleDocumentTypeList } from 'maestro-shared/schema/File/FileType';
import {
  isCreatedPartialSample,
  isOutsideProgrammingPlanSample,
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleToCreate,
  prescriptionSubstancesCheck,
  sampleMatrixCheck,
  SampleMatrixData
} from 'maestro-shared/schema/Sample/Sample';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SupportDocumentDownload from 'src/views/SampleView/DraftSample/SupportDocumentDownload';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import { unknown, z } from 'zod';
import AppServiceErrorAlert from '../../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import AppSelect from '../../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../../components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import AppUpload from '../../../../components/_app/AppUpload/AppUpload';
import SampleDocument from '../../../../components/Sample/SampleDocument/SampleDocument';
import SampleProcedure from '../../../../components/Sample/SampleProcedure/SampleProcedure';
import SubstanceSearch from '../../../../components/SubstanceSearch/SubstanceSearch';
import { useAnalytics } from '../../../../hooks/useAnalytics';
import { usePartialSample } from '../../../../hooks/usePartialSample';
import { ApiClientContext } from '../../../../services/apiClient';
import NextButton from '../NextButton';
import {
  MatrixSpecificDataForm,
  MatrixSpecificDataFormInputProps
} from './MatrixSpecificDataForm';
import MatrixSpecificDataFormInput from './MatrixSpecificDataFormInput';
import { SampleMatrixSpecificDataKeys } from './MatrixSpecificDataFormInputs';

type Props = {
  partialSample: PartialSample | PartialSampleToCreate;
};

const MatrixStep = ({ partialSample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();
  const {
    readonly,
    programmingPlanPrescriptions,
    programmingPlanLocalPrescriptions
  } = usePartialSample(partialSample);
  const { trackEvent } = useAnalytics();

  const isSubmittingRef = useRef<boolean>(false);
  const [matrixKind, setMatrixKind] = useState(partialSample.matrixKind);
  const [matrix, setMatrix] = useState(partialSample.matrix);
  const [stage, setStage] = useState(partialSample.stage);
  const [notesOnMatrix, setNotesOnMatrix] = useState(
    partialSample.notesOnMatrix
  );
  const [monoSubstances, setMonoSubstances] = useState(
    partialSample.monoSubstances ?? null
  );
  const [multiSubstances, setMultiSubstances] = useState(
    partialSample.multiSubstances ?? null
  );

  const [specificData, setSpecificData] = useState(partialSample.specificData);
  const [files, setFiles] = useState<File[]>([]);
  const [documentIds, setDocumentIds] = useState(partialSample.documentIds);
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdateSample, createOrUpdateSampleCall] =
    apiClient.useCreateOrUpdateSampleMutation();
  const [createDocument] = apiClient.useCreateDocumentMutation();
  const [deleteDocument] = apiClient.useDeleteDocumentMutation();

  const prescriptions = useMemo(() => {
    return programmingPlanPrescriptions?.filter(
      (prescription) =>
        prescription.context === partialSample.context &&
        programmingPlanLocalPrescriptions?.some(
          (localPrescription) =>
            localPrescription.prescriptionId === prescription.id
        )
    );
  }, [
    programmingPlanPrescriptions,
    programmingPlanLocalPrescriptions,
    partialSample
  ]);

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
    await form.validate(async () => {
      isSubmittingRef.current = true;
      await save('DraftItems');
    });
  };

  const save = async (status: SampleStatus = partialSample.status) => {
    await createOrUpdateSample({
      ...partialSample,
      matrixKind,
      matrix,
      stage,
      specificData,
      notesOnMatrix,
      monoSubstances,
      multiSubstances,
      documentIds,
      status
    });
  };

  const form = useForm(
    SampleMatrixData.omit({
      documentIds: true
    }).check(prescriptionSubstancesCheck, sampleMatrixCheck),
    {
      matrixKind,
      matrix,
      stage,
      specificData,
      notesOnMatrix,
      prescriptionId: partialSample.prescriptionId,
      monoSubstances,
      multiSubstances,
      substances: unknown
    },
    save
  );

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
                  p.programmingPlanKind === specificData.programmingPlanKind &&
                  p.matrixKind === matrixKind
              )
            )
          : MatrixKindList,
        {
          labels: MatrixKindLabels,
          withSort: true,
          withDefault: false
        }
      ),
    [prescriptions, partialSample, specificData.programmingPlanKind]
  );

  const matrixOptions = useMemo(
    () =>
      selectOptionsFromList(
        matrixKind === OtherMatrixKind.value
          ? []
          : matrixKind
            ? (MatrixListByKind[matrixKind as MatrixKind]?.filter((m) =>
                isProgrammingPlanSample(partialSample)
                  ? prescriptions?.some(
                      (p) =>
                        p.programmingPlanKind ===
                          specificData.programmingPlanKind &&
                        p.matrixKind === matrixKind &&
                        (isNil(p.matrix) || p.matrix === m)
                    )
                  : true
              ) ?? matrixKind)
            : [],
        {
          labels: MatrixLabels,
          withSort: true,
          withDefault: false
        }
      ),
    [matrixKind, prescriptions, specificData.programmingPlanKind, partialSample]
  );

  const stageOptions = useMemo(
    () =>
      selectOptionsFromList(
        StagesByProgrammingPlanKind[specificData.programmingPlanKind].filter(
          (stage) =>
            !isProgrammingPlanSample(partialSample) ||
            prescriptions?.find(
              (p) =>
                p.programmingPlanKind === specificData.programmingPlanKind &&
                p.matrixKind === matrixKind &&
                p.stages.includes(stage)
            )
        ),
        {
          labels: StageLabels,
          defaultLabel: 'Sélectionner un stade',
          withDefault: 'auto'
        }
      ),
    [partialSample, prescriptions, specificData.programmingPlanKind, matrixKind]
  );

  return (
    <form data-testid="draft_sample_matrix_form" className="sample-form">
      <div>
        <Button
          {...PreviousButton({
            sampleId: partialSample.id,
            currentStep: 2,
            onSave: readonly ? undefined : () => save('Draft')
          })}
          size="small"
          priority="tertiary no outline"
          className={cx('fr-pl-0', 'fr-mb-1v')}
        >
          Étape précédente
        </Button>
        <AppRequiredText />
      </div>

      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {(
          Object.entries(
            MatrixSpecificDataForm[specificData.programmingPlanKind]
          ) as [
            SampleMatrixSpecificDataKeys,
            MatrixSpecificDataFormInputProps
          ][]
        )
          .filter(([_, inputProps]) => inputProps.position === 'pre')
          .map(([inputKey, inputProps]) => (
            <MatrixSpecificDataFormInput
              key={inputKey}
              inputKey={inputKey}
              inputProps={inputProps}
              inputForm={form}
              specificData={specificData}
              onChange={setSpecificData}
            />
          ))}
        <div className={cx('fr-col-12', 'fr-pb-0')}>
          <span className={cx('fr-text--md', 'fr-text--bold')}>
            La matrice à prélever
          </span>
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSearchInput
            value={matrixKind ?? ''}
            options={matrixKindOptions}
            placeholder="Sélectionner une catégorie"
            onSelect={(value) => {
              setMatrixKind(value as MatrixKind);
              setMatrix(null);
              setStage(null);
            }}
            state={form.messageType('matrixKind')}
            stateRelatedMessage={form.message('matrixKind')}
            whenValid="Type de matrice correctement renseignée."
            label="Catégorie de matrice programmée"
            required={matrixKind !== OtherMatrixKind.value}
            inputProps={{
              disabled: matrixKind === OtherMatrixKind.value,
              'data-testid': 'matrix-kind-select'
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.value}>
                {option.label}
              </li>
            )}
          />
          {isOutsideProgrammingPlanSample(partialSample) && (
            <Checkbox
              options={[
                {
                  label: 'Autre matrice non répertoriée',
                  nativeInputProps: {
                    checked: matrixKind === OtherMatrixKind.value,
                    onChange: (e) => {
                      if (e.target.checked) {
                        setMatrixKind(OtherMatrixKind.value);
                        setMatrix(null);
                      } else {
                        setMatrixKind(null);
                        setMatrix(null);
                      }
                    }
                  }
                }
              ]}
            />
          )}
        </div>
        <div
          className={cx('fr-col-12', 'fr-col-sm-6', {
            'fr-mt-12w': matrixKind === OtherMatrixKind.value
          })}
        >
          {matrixKind === OtherMatrixKind.value ? (
            <AppTextInput
              defaultValue={matrix ?? ''}
              onChange={(e) => setMatrix(e.target.value)}
              inputForm={form}
              inputKey="matrix"
              whenValid="Matrice correctement renseignée."
              required
              label="Matrice"
            />
          ) : (
            <AppSearchInput
              value={matrix ?? ''}
              options={matrixOptions}
              placeholder="Sélectionner une matrice"
              onSelect={(value) => {
                setMatrix(value as Matrix);
              }}
              state={form.messageType('matrix')}
              stateRelatedMessage={form.message('matrix')}
              whenValid="Matrice correctement renseignée."
              data-testid="matrix-select"
              label="Matrice"
              required
              inputProps={{
                'data-testid': 'matrix-select'
              }}
            />
          )}
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect
            value={stage ?? ''}
            options={stageOptions}
            onChange={(e) => setStage(e.target.value as Stage)}
            inputForm={form}
            inputKey="stage"
            whenValid="Stade de prélèvement correctement renseigné."
            data-testid="stage-select"
            label="Stade de prélèvement"
            required
          />
        </div>
      </div>
      <SampleProcedure partialSample={partialSample} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {(
          Object.entries(
            MatrixSpecificDataForm[specificData.programmingPlanKind]
          ) as [
            SampleMatrixSpecificDataKeys,
            MatrixSpecificDataFormInputProps
          ][]
        )
          .filter(([_, inputProps]) => inputProps.position !== 'pre')
          .map(([inputKey, inputProps]) => (
            <MatrixSpecificDataFormInput
              key={inputKey}
              inputKey={inputKey}
              inputProps={inputProps}
              inputForm={form}
              specificData={specificData}
              onChange={setSpecificData}
            />
          ))}

        {!isProgrammingPlanSample(partialSample) && (
          <>
            <div className={cx('fr-col-12', 'fr-mt-2w', 'fr-pb-1v')}>
              <span className={cx('fr-text--md', 'fr-text--bold')}>
                Analyses mono-résidu et/ou multi-résidus
              </span>
            </div>
            <div className={cx('fr-col-12')}>
              <Checkbox
                options={[
                  {
                    label: 'Mono-résidu',
                    nativeInputProps: {
                      checked: !isNil(monoSubstances),
                      onChange: (e) => {
                        if (e.target.checked) {
                          setMonoSubstances([]);
                        } else {
                          setMonoSubstances(null);
                        }
                      }
                    }
                  }
                ]}
                className={cx('fr-mb-2w')}
              />
              {monoSubstances && (
                <SubstanceSearch
                  label="Sélectionner la liste des mono-résidu"
                  analysisMethod="Mono"
                  substances={monoSubstances}
                  onChangeSubstances={setMonoSubstances}
                  addButtonMode="none"
                />
              )}
              {form.hasIssue('monoSubstances') && (
                <div className={cx('fr-error-text')}>
                  {form.message('monoSubstances')}
                </div>
              )}
            </div>
            <div className={cx('fr-col-12')}>
              <Checkbox
                options={[
                  {
                    label: 'Multi-résidus',
                    nativeInputProps: {
                      checked: !isNil(multiSubstances),
                      onChange: (e) => {
                        if (e.target.checked) {
                          setMultiSubstances([]);
                        } else {
                          setMultiSubstances(null);
                        }
                      }
                    }
                  }
                ]}
              />
            </div>

            {form.hasIssue('substances') && (
              <div className={cx('fr-error-text', 'fr-mt-0')}>
                {form.message('substances')}
              </div>
            )}
          </>
        )}
      </div>
      <div className={cx('fr-col-12')}>
        <hr />
      </div>
      {renderSampleAttachments?.()}
      <hr />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextAreaInput
            defaultValue={notesOnMatrix ?? ''}
            onChange={(e) => setNotesOnMatrix(e.target.value)}
            inputForm={form}
            inputKey="notesOnMatrix"
            whenValid="Note correctement renseignée."
            data-testid="notes-input"
            label="Note additionnelle"
            hintText={
              partialSample?.specificData.programmingPlanKind === 'PPV'
                ? 'Champ facultatif pour précisions supplémentaires (date de semis, précédent cultural, traitements faits, protocole de prélèvement et note inspecteur, etc.)'
                : ''
            }
          />
        </div>
      </div>

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
