import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { isNil } from 'lodash-es';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  OtherMatrixKind
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import { Stage } from 'maestro-shared/referential/Stage';
import {
  isOutsideProgrammingPlanSample,
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleToCreate,
  prescriptionSubstancesCheck,
  sampleMatrixCheck,
  SampleMatrixData
} from 'maestro-shared/schema/Sample/Sample';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import {
  forwardRef,
  Fragment,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import {
  AppSelectOption,
  selectOptionsFromList
} from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { JSONSchema } from 'zod/dist/types/v4/core/json-schema';
import { unknown, z } from 'zod/v4';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import SubstanceSearch from '../../../../components/SubstanceSearch/SubstanceSearch';
import { useForm } from '../../../../hooks/useForm';
import { MatrixSpecificDataForm } from './MatrixSpecificDataForm';
import {
  MatrixSpecificDataFormInputs,
  SampleMatrixSpecificDataKeys
} from './MatrixSpecificDataFormInputs';
import { MatrixStepRef } from './MatrixStep';

const SampleMatrixBaseData = SampleMatrixData.omit({
  documentIds: true,
  laboratoryId: true
});

type SampleMatrixBaseData = z.infer<typeof SampleMatrixBaseData>;

type Props = {
  partialSample: PartialSample | PartialSampleToCreate;
  matrixKindOptions: AppSelectOption[];
  stageOptions: AppSelectOption[];
  onSave: (sampleMatrixFormData: SampleMatrixBaseData) => Promise<void>;
  onSubmit: () => Promise<void>;
  renderSampleAttachments?: () => ReactNode;
};

const MatrixStepGeneric = forwardRef<MatrixStepRef, Props>(
  (
    {
      partialSample,
      matrixKindOptions,
      stageOptions,
      onSave,
      onSubmit,
      renderSampleAttachments
    },
    ref
  ) => {
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

    const [specificData, setSpecificData] = useState(
      partialSample.specificData
    );

    const save = async () =>
      onSave({
        matrixKind,
        matrix,
        stage,
        specificData,
        notesOnMatrix,
        monoSubstances,
        multiSubstances
      } as SampleMatrixBaseData);

    const form = useForm(
      SampleMatrixBaseData.check(
        prescriptionSubstancesCheck,
        sampleMatrixCheck
      ),
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

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await form.validate(async () => {
          await onSubmit();
        });
      }
    }));

    const jsonSchema = useMemo(
      () =>
        z
          .toJSONSchema(SampleMatrixSpecificData)
          .anyOf?.find(
            (schema) =>
              (schema.properties?.programmingPlanKind as JSONSchema).const ===
              specificData.programmingPlanKind
          ) as JSONSchema,
      [specificData.programmingPlanKind]
    );

    return (
      <>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
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
                options={selectOptionsFromList(
                  matrixKind
                    ? (MatrixListByKind[matrixKind as MatrixKind] ?? matrixKind)
                    : [],
                  {
                    labels: MatrixLabels,
                    withSort: true,
                    withDefault: false
                  }
                )}
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
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          {(
            Object.entries(
              MatrixSpecificDataForm[specificData.programmingPlanKind]
            ) as [SampleMatrixSpecificDataKeys, { order: number }][]
          )
            .sort((a, b) => a[1].order - b[1].order)
            .map(([key]) => (
              <Fragment key={key}>
                {(() => {
                  switch (MatrixSpecificDataFormInputs[key].inputType) {
                    case 'text':
                      return (
                        <div className={cx('fr-col-12')}>
                          <AppTextInput
                            defaultValue={(specificData as any)[key] ?? ''}
                            onChange={(e) =>
                              setSpecificData((prev) => ({
                                ...prev,
                                [key]: e.target.value
                              }))
                            }
                            inputForm={form}
                            inputKey="specificData"
                            inputPathFromKey={[key]}
                            label={
                              MatrixSpecificDataFormInputs[key].label ?? key
                            }
                            hintText={
                              MatrixSpecificDataFormInputs[key].hintText
                            }
                            whenValid={
                              MatrixSpecificDataFormInputs[key].whenValid ??
                              'Champ correctement renseigné.'
                            }
                            required={jsonSchema.required?.includes(key)}
                            data-testid={
                              MatrixSpecificDataFormInputs[key].testId
                            }
                          />
                        </div>
                      );

                    case 'textarea':
                      return (
                        <div className={cx('fr-col-12')}>
                          <AppTextAreaInput
                            defaultValue={(specificData as any)[key] ?? ''}
                            onChange={(e) =>
                              setSpecificData((prev) => ({
                                ...prev,
                                [key]: e.target.value
                              }))
                            }
                            inputForm={form}
                            inputKey="specificData"
                            inputPathFromKey={[key]}
                            label={
                              MatrixSpecificDataFormInputs[key].label ?? key
                            }
                            hintText={
                              MatrixSpecificDataFormInputs[key].hintText
                            }
                            whenValid={
                              MatrixSpecificDataFormInputs[key].whenValid ??
                              'Champ correctement renseigné.'
                            }
                            required={jsonSchema.required?.includes(key)}
                            data-testid={
                              MatrixSpecificDataFormInputs[key].testId
                            }
                          />
                        </div>
                      );

                    case 'select':
                      return (
                        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                          <AppSelect
                            defaultValue={(specificData as any)[key] ?? ''}
                            options={selectOptionsFromList(
                              ((jsonSchema.properties?.[key] as JSONSchema)
                                .enum as string[]) ?? [],
                              {
                                labels:
                                  MatrixSpecificDataFormInputs[key]
                                    .optionsLabels,
                                defaultLabel:
                                  MatrixSpecificDataFormInputs[key]
                                    .defaultOptionLabel
                              }
                            )}
                            onChange={(e) =>
                              setSpecificData((prev) => ({
                                ...prev,
                                [key]: e.target.value
                              }))
                            }
                            inputForm={form}
                            inputKey="specificData"
                            inputPathFromKey={[key]}
                            label={
                              MatrixSpecificDataFormInputs[key].label ?? key
                            }
                            whenValid={
                              MatrixSpecificDataFormInputs[key].whenValid ??
                              'Champ correctement renseigné.'
                            }
                            required={jsonSchema.required?.includes(key)}
                            data-testid={
                              MatrixSpecificDataFormInputs[key].testId
                            }
                          />
                        </div>
                      );

                    case 'checkbox':
                      return (
                        <div className={cx('fr-col-12', 'fr-mt-2w')}>
                          <ToggleSwitch
                            label={
                              MatrixSpecificDataFormInputs[key].label ?? key
                            }
                            checked={Boolean((specificData as any)[key])}
                            onChange={(checked) =>
                              setSpecificData((prev) => ({
                                ...prev,
                                [key]: checked
                              }))
                            }
                            showCheckedHint={false}
                            data-testid={
                              MatrixSpecificDataFormInputs[key].testId
                            }
                          />
                        </div>
                      );

                    case 'radio':
                      return (
                        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                          <AppRadioButtons
                            legend={
                              MatrixSpecificDataFormInputs[key].label ?? key
                            }
                            options={
                              selectOptionsFromList(
                                ((jsonSchema.properties?.[key] as JSONSchema)
                                  .enum as string[]) ?? [],
                                {
                                  labels:
                                    MatrixSpecificDataFormInputs[key]
                                      .optionsLabels,
                                  withDefault: false
                                }
                              ).map(({ label, value }) => ({
                                key: `${MatrixSpecificDataFormInputs[key].testId}-option-${value}`,
                                label,
                                nativeInputProps: {
                                  checked: (specificData as any)[key] === value,
                                  onChange: () =>
                                    setSpecificData((prev) => ({
                                      ...prev,
                                      [key]: value
                                    }))
                                }
                              })) ?? []
                            }
                            colSm={MatrixSpecificDataFormInputs[key].colSm}
                            inputForm={form}
                            inputKey="specificData"
                            inputPathFromKey={[key]}
                            required={jsonSchema.required?.includes(key)}
                            data-testid={
                              MatrixSpecificDataFormInputs[key].testId
                            }
                          />
                        </div>
                      );

                    default:
                      return null;
                  }
                })()}
              </Fragment>
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
              <div className={cx('fr-col-12')}>
                <hr />
              </div>
            </>
          )}
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
              hintText="Champ facultatif pour précisions supplémentaires (date de semis, précédent cultural, traitements faits, protocole de prélèvement et note inspecteur, etc.)"
            />
          </div>
        </div>
      </>
    );
  }
);

export default MatrixStepGeneric;
