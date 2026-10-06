import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import type { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  type MatrixKind,
  MatrixKindLabels,
  MatrixKindList,
  OtherMatrixKind
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { SampleDocumentTypeList } from 'maestro-shared/schema/File/FileType';
import {
  type Context,
  ContextLabels,
  ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  findPrescriptionSubPlan,
  isPPVSubPlanNumber,
  type ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  getSubPlanMatrixKinds,
  isMatrixSelected
} from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import {
  isCreatedPartialSample,
  isOutsideProgrammingPlanSample,
  isProgrammingPlanSample,
  type PartialSample,
  type PartialSampleToCreate,
  prescriptionSubstancesCheck,
  SampleMatrixData
} from 'maestro-shared/schema/Sample/Sample';
import {
  type PartialSampleMatrix,
  sampleMatricesIssues
} from 'maestro-shared/schema/Sample/SampleMatrix';
import {
  type SampleStep,
  SampleSteps
} from 'maestro-shared/schema/Sample/SampleStep';
import { buildSpecificDataSchema } from 'maestro-shared/schema/SpecificData/buildSpecificDataSchema';
import { isDefined, toArray } from 'maestro-shared/utils/utils';
import { checkSchema } from 'maestro-shared/utils/zod';
import type React from 'react';
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SupportDocumentDownload from 'src/views/SampleView/DraftSample/SupportDocumentDownload';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import { unknown, z } from 'zod';
import AppServiceErrorAlert from '../../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
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
import MatrixSpecificDataFormInput from './MatrixSpecificDataFormInput';
import { specificDataFormLayout } from './SpecificDataForm';

type Props = {
  partialSample: PartialSample | PartialSampleToCreate;
};

const MatrixStep = ({ partialSample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();
  const { user } = useAuthentication();
  const { readonly, programmingPlan } = usePartialSample(partialSample);
  const { trackEvent } = useAnalytics();

  const isSubmittingRef = useRef<boolean>(false);
  const [matrices, setMatrices] = useState<PartialSampleMatrix[]>(
    partialSample.matrices ?? []
  );
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
  const [createDocument] = apiClient.useCreateSampleDocumentMutation();
  const [deleteDocument] = apiClient.useDeleteSampleDocumentMutation();

  const programmingSubPlanId = partialSample.programmingSubPlanId;
  const planSubPlans =
    (programmingPlan as ProgrammingPlanChecked)?.subPlans ?? [];

  const { data: prescriptionsData } = apiClient.useFindPrescriptionsQuery(
    {
      programmingPlanId: partialSample.programmingPlanId,
      contexts: toArray(
        ProgrammingPlanContext.safeParse(partialSample.context).data
      )
    },
    {
      skip: !partialSample.programmingPlanId
    }
  );

  const { data: localPrescriptions } = apiClient.useFindLocalPrescriptionsQuery(
    {
      programmingPlanIds: [partialSample.programmingPlanId],
      contexts: toArray(
        ProgrammingPlanContext.safeParse(partialSample.context).data
      ),
      region: isCreatedPartialSample(partialSample)
        ? partialSample.region
        : user?.region,
      ...((programmingPlan as ProgrammingPlanChecked).distributionKind ===
      'SLAUGHTERHOUSE'
        ? {
            department: partialSample.department,
            companySiret: partialSample.company?.siret
          }
        : {})
    },
    {
      skip: !programmingPlan || !isProgrammingPlanSample(partialSample)
    }
  );

  const prescriptionSubPlans = useMemo(
    () =>
      prescriptionsData
        ?.filter((p) =>
          localPrescriptions?.find((rp) => rp.prescriptionId === p.id)
        )
        .map((p) => findPrescriptionSubPlan([{ subPlans: planSubPlans }], p))
        .filter(isDefined),
    [prescriptionsData, localPrescriptions, planSubPlans]
  );

  const subPlanMatrices = prescriptionSubPlans?.find(
    (subPlan) => subPlan.id === programmingSubPlanId
  )?.matrices;

  const andItems =
    isProgrammingPlanSample(partialSample) &&
    subPlanMatrices?.operator === 'And'
      ? subPlanMatrices.items
      : undefined;

  const toFormMatrices = (
    current: PartialSampleMatrix[]
  ): PartialSampleMatrix[] =>
    andItems
      ? andItems.map(
          ({ matrixKind }) =>
            current.find((m) => m.matrixKind === matrixKind) ?? {
              matrixKind,
              matrix: null
            }
        )
      : [current[0] ?? { matrixKind: null, matrix: null }];

  const formMatrices = toFormMatrices(matrices);

  const changeMatrix = (index: number, change: PartialSampleMatrix) =>
    setMatrices((current) =>
      toFormMatrices(current).map((sampleMatrix, i) =>
        i === index ? { ...sampleMatrix, ...change } : sampleMatrix
      )
    );

  const subPlanNumber =
    planSubPlans.find((sp) => sp.id === programmingSubPlanId)?.subPlanNumber ??
    '';

  const { data: fieldConfigs = [], isSuccess: isFieldConfigsLoaded } =
    apiClient.useFindProgrammingSubPlanFieldConfigsQuery(
      {
        programmingPlanId: partialSample.programmingPlanId,
        programmingSubPlanId: programmingSubPlanId as ProgrammingSubPlanId
      },
      { skip: !programmingSubPlanId }
    );

  const planLayout = specificDataFormLayout(subPlanNumber);

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
    if (!isSubmittingRef.current) {
      await form.validate(async () => {
        isSubmittingRef.current = true;
        await save('DraftItems');
      });
    }
  };

  const save = async (step: SampleStep = partialSample.step) => {
    await createOrUpdateSample({
      ...partialSample,
      programmingSubPlanId: programmingSubPlanId,
      matrices: formMatrices.filter(({ matrixKind }) => !isNil(matrixKind)),
      specificData,
      notesOnMatrix,
      monoSubstances,
      multiSubstances,
      documentIds,
      step
    });
  };

  const specificDataSchema = useMemo(
    () => buildSpecificDataSchema(fieldConfigs),
    [fieldConfigs]
  );

  const form = useForm(
    checkSchema(
      SampleMatrixData.omit({ documentIds: true, specificData: true }).extend({
        specificData: specificDataSchema
      }),
      prescriptionSubstancesCheck,
      (ctx) => {
        if (isProgrammingPlanSample(partialSample)) {
          sampleMatricesIssues(
            ctx.value.matrices,
            subPlanMatrices ?? null
          ).forEach(({ path, message }) => {
            ctx.issues.push({
              code: 'custom' as const,
              path,
              input: ctx.value.matrices,
              message
            });
          });
        }
      }
    ),
    {
      matrices: formMatrices,
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
            sampleId: partialSample.id,
            file
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
    await deleteDocument({ sampleId: partialSample.id, documentId });
    setDocumentIds((documentIds ?? []).filter((id) => id !== documentId));
  };

  const renderSampleAttachments = useMemo(
    () => () =>
      (!readonly || (documentIds ?? []).length > 0) && (
        <>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <span className={cx('fr-text--md', 'fr-text--bold')}>
                Compléments
              </span>
              {!readonly && (
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
              )}
            </div>
          </div>

          {documentIds?.map((documentId) => (
            <SampleDocument
              key={`document-${documentId}`}
              sampleId={partialSample.id}
              documentId={documentId}
              onRemove={readonly ? undefined : () => removeDocument(documentId)}
            />
          ))}
        </>
      ),
    [documentIds, filesForm] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const matrixKindOptions = useMemo(
    () =>
      prescriptionSubPlans
        ? selectOptionsFromList(
            isProgrammingPlanSample(partialSample)
              ? MatrixKindList.filter((matrixKind) =>
                  prescriptionSubPlans.some(
                    (subPlan) =>
                      (!programmingSubPlanId ||
                        subPlan.id === programmingSubPlanId) &&
                      getSubPlanMatrixKinds(subPlan.matrices).includes(
                        matrixKind
                      )
                  )
                )
              : MatrixKindList,
            {
              labels: MatrixKindLabels,
              withSort: true,
              withDefault: false
            }
          )
        : undefined,
    [prescriptionSubPlans, partialSample, programmingSubPlanId]
  );

  const matrixOptions = (matrixKind?: MatrixKind | OtherMatrixKind | null) =>
    selectOptionsFromList(
      matrixKind === OtherMatrixKind.value
        ? []
        : matrixKind
          ? (MatrixListByKind[matrixKind]?.filter((m) =>
              isProgrammingPlanSample(partialSample)
                ? prescriptionSubPlans?.some(
                    (subPlan) =>
                      (!programmingSubPlanId ||
                        subPlan.id === programmingSubPlanId) &&
                      isMatrixSelected(
                        subPlan.matrices?.items.find(
                          (item) => item.matrixKind === matrixKind
                        ),
                        m
                      )
                  )
                : true
            ) ?? matrixKind)
          : [],
      {
        labels: MatrixLabels,
        withSort: true,
        withDefault: false
      }
    );

  return (
    <form data-testid="draft_sample_matrix_form" className="sample-form">
      <div>
        <div className={clsx(cx('fr-mb-1v'), 'd-flex-align-center')}>
          <div className={clsx('flex-grow-1')}>
            <Button
              {...PreviousButton({
                sampleId: partialSample.id,
                currentStep: 2,
                onSave: readonly ? undefined : () => save('Draft')
              })}
              size="small"
              priority="tertiary no outline"
              className={cx('fr-pl-0')}
            >
              Étape précédente
            </Button>
          </div>
          {Boolean(matrixKindOptions?.length) &&
            (!readonly || SampleSteps[partialSample.step] > 2) && (
              <Button
                size="small"
                priority="tertiary no outline"
                className={cx('fr-pr-0')}
                iconId="fr-icon-arrow-right-line"
                iconPosition="right"
                disabled={!readonly && !isFieldConfigsLoaded}
                onClick={async (e) =>
                  readonly ? navigateToSample(partialSample.id, 3) : submit(e)
                }
              >
                Étape suivante
              </Button>
            )}
        </div>
        <AppRequiredText />
      </div>
      {matrixKindOptions?.length === 0 && (
        <Alert
          severity="info"
          small={true}
          description={`Aucune matrice programmée pour le ${ContextLabels[partialSample.context as Context].toLowerCase()}`}
        />
      )}
      {matrixKindOptions && matrixKindOptions?.length > 0 && (
        <>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-pb-0')}>
              <span className={cx('fr-text--md', 'fr-text--bold')}>
                {andItems ? 'Les matrices à prélever' : 'La matrice à prélever'}
              </span>
            </div>
            {formMatrices.map((sampleMatrix, index) => (
              <Fragment key={`matrix-${index}`}>
                <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                  <AppSearchInput
                    value={sampleMatrix.matrixKind ?? ''}
                    options={
                      andItems
                        ? selectOptionsFromList([andItems[index].matrixKind], {
                            labels: MatrixKindLabels,
                            withDefault: false
                          })
                        : matrixKindOptions
                    }
                    placeholder="Sélectionner une catégorie"
                    onSelect={(value) =>
                      changeMatrix(index, {
                        matrixKind: value as MatrixKind,
                        matrix: null
                      })
                    }
                    state={form.messageType('matrices', [index, 'matrixKind'])}
                    stateRelatedMessage={form.message('matrices', [
                      index,
                      'matrixKind'
                    ])}
                    whenValid="Type de matrice correctement renseignée."
                    label="Catégorie de matrice programmée"
                    required={sampleMatrix.matrixKind !== OtherMatrixKind.value}
                    inputProps={{
                      disabled:
                        readonly ||
                        !!andItems ||
                        sampleMatrix.matrixKind === OtherMatrixKind.value,
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
                            checked:
                              sampleMatrix.matrixKind === OtherMatrixKind.value,
                            onChange: (e) =>
                              changeMatrix(index, {
                                matrixKind: e.target.checked
                                  ? OtherMatrixKind.value
                                  : null,
                                matrix: null
                              })
                          }
                        }
                      ]}
                      disabled={readonly}
                    />
                  )}
                </div>
                <div
                  className={cx('fr-col-12', 'fr-col-sm-6', {
                    'fr-mt-12w':
                      sampleMatrix.matrixKind === OtherMatrixKind.value
                  })}
                >
                  {sampleMatrix.matrixKind === OtherMatrixKind.value ? (
                    <AppTextInput
                      defaultValue={sampleMatrix.matrix ?? ''}
                      onChange={(e) =>
                        changeMatrix(index, { matrix: e.target.value })
                      }
                      inputForm={form}
                      inputKey="matrices"
                      inputPathFromKey={[index, 'matrix']}
                      whenValid="Matrice correctement renseignée."
                      required
                      label="Matrice"
                      disabled={readonly}
                    />
                  ) : (
                    <AppSearchInput
                      value={sampleMatrix.matrix ?? ''}
                      options={matrixOptions(sampleMatrix.matrixKind)}
                      placeholder="Sélectionner une matrice"
                      onSelect={(value) =>
                        changeMatrix(index, { matrix: value as Matrix })
                      }
                      state={form.messageType('matrices', [index, 'matrix'])}
                      stateRelatedMessage={form.message('matrices', [
                        index,
                        'matrix'
                      ])}
                      whenValid="Matrice correctement renseignée."
                      data-testid="matrix-select"
                      label="Matrice"
                      required
                      inputProps={{
                        disabled: readonly,
                        'data-testid': 'matrix-select'
                      }}
                    />
                  )}
                </div>
              </Fragment>
            ))}
            {form.hasIssue('matrices') && (
              <div className={cx('fr-col-12', 'fr-error-text', 'fr-mt-0')}>
                {form.message('matrices')}
              </div>
            )}
          </div>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            {fieldConfigs.map((fc) => (
              <MatrixSpecificDataFormInput
                key={fc.field.key}
                fieldConfig={fc}
                inputProps={planLayout?.[fc.field.key] ?? {}}
                inputForm={form}
                specificData={specificData}
                onChange={setSpecificData}
                disabled={readonly}
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
                          },
                          disabled: readonly
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
                          },
                          disabled: readonly
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
          <SampleProcedure partialSample={partialSample} />
          {renderSampleAttachments?.()}
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
                  isPPVSubPlanNumber(subPlanNumber)
                    ? 'Champ facultatif pour précisions supplémentaires (date de semis, précédent cultural, traitements faits, protocole de prélèvement et note inspecteur, etc.)'
                    : ''
                }
                disabled={readonly}
              />
            </div>
          </div>
        </>
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
              {matrixKindOptions?.length && !readonly ? (
                <Button
                  onClick={submit}
                  iconId="fr-icon-arrow-right-line"
                  iconPosition="right"
                  data-testid="submit-button"
                  disabled={!isFieldConfigsLoaded}
                >
                  Continuer
                </Button>
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
      <SavedAlert isOpen={isSaved} isDraft sample={partialSample} />
    </form>
  );
};

export default MatrixStep;
