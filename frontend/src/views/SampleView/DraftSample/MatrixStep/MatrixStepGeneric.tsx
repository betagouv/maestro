import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
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
import {
  MatrixSpecificDataForm,
  MatrixSpecificDataFormInputProps
} from './MatrixSpecificDataForm';
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

    const requiredInputs = useMemo(
      () =>
        (
          z
            .toJSONSchema(SampleMatrixSpecificData)
            .anyOf?.find(
              (schema) =>
                (schema.properties?.programmingPlanKind as JSONSchema).const ===
                specificData.programmingPlanKind
            ) as JSONSchema
        ).required ?? [],
      [specificData.programmingPlanKind]
    );

    const renderFormInput = ({
      inputKey,
      inputProps
    }: {
      inputKey: SampleMatrixSpecificDataKeys;
      inputProps: MatrixSpecificDataFormInputProps;
    }) => (
      <Fragment key={inputKey}>
        {inputProps.preTitle && (
          <div className={cx('fr-col-12', 'fr-pt-3w', 'fr-pb-0')}>
            <span className={cx('fr-text--md', 'fr-text--bold')}>
              {inputProps.preTitle}
            </span>
          </div>
        )}
        {(() => {
          switch (MatrixSpecificDataFormInputs[inputKey].inputType) {
            case 'text':
              return (
                <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                  <AppTextInput
                    defaultValue={(specificData as any)[inputKey] ?? ''}
                    onChange={(e) =>
                      setSpecificData((prev) => ({
                        ...prev,
                        [inputKey]: e.target.value
                      }))
                    }
                    inputForm={form}
                    inputKey="specificData"
                    inputPathFromKey={[inputKey]}
                    label={
                      MatrixSpecificDataFormInputs[inputKey].label ?? inputKey
                    }
                    hintText={MatrixSpecificDataFormInputs[inputKey].hintText}
                    whenValid={
                      MatrixSpecificDataFormInputs[inputKey].whenValid ??
                      'Champ correctement renseigné.'
                    }
                    required={requiredInputs.includes(inputKey)}
                    data-testid={MatrixSpecificDataFormInputs[inputKey].testId}
                  />
                </div>
              );

            case 'number':
              return (
                <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                  <AppTextInput
                    type="number"
                    defaultValue={(specificData as any)[inputKey] ?? ''}
                    onChange={(e) =>
                      setSpecificData((prev) => ({
                        ...prev,
                        [inputKey]: e.target.value
                      }))
                    }
                    inputForm={form}
                    inputKey="specificData"
                    inputPathFromKey={[inputKey]}
                    label={
                      MatrixSpecificDataFormInputs[inputKey].label ?? inputKey
                    }
                    hintText={MatrixSpecificDataFormInputs[inputKey].hintText}
                    whenValid={
                      MatrixSpecificDataFormInputs[inputKey].whenValid ??
                      'Champ correctement renseigné.'
                    }
                    required={requiredInputs.includes(inputKey)}
                    min={0}
                    data-testid={MatrixSpecificDataFormInputs[inputKey].testId}
                  />
                </div>
              );

            case 'textarea':
              return (
                <div
                  className={clsx(
                    cx('fr-col-12', 'fr-col-sm-6'),
                    inputProps.classes?.container
                  )}
                >
                  <AppTextAreaInput
                    defaultValue={(specificData as any)[inputKey] ?? ''}
                    onChange={(e) =>
                      setSpecificData((prev) => ({
                        ...prev,
                        [inputKey]: e.target.value
                      }))
                    }
                    inputForm={form}
                    inputKey="specificData"
                    inputPathFromKey={[inputKey]}
                    label={
                      MatrixSpecificDataFormInputs[inputKey].label ?? inputKey
                    }
                    hintText={MatrixSpecificDataFormInputs[inputKey].hintText}
                    whenValid={
                      MatrixSpecificDataFormInputs[inputKey].whenValid ??
                      'Champ correctement renseigné.'
                    }
                    required={requiredInputs.includes(inputKey)}
                    rows={MatrixSpecificDataFormInputs[inputKey].rows ?? 3}
                    data-testid={MatrixSpecificDataFormInputs[inputKey].testId}
                  />
                </div>
              );

            case 'select':
              return (
                <div
                  className={clsx(
                    cx('fr-col-12', 'fr-col-sm-6'),
                    inputProps.classes?.container
                  )}
                >
                  <AppSelect
                    defaultValue={(specificData as any)[inputKey] ?? ''}
                    options={selectOptionsFromList(
                      Array.isArray(
                        MatrixSpecificDataFormInputs[inputKey].optionsValues
                      )
                        ? MatrixSpecificDataFormInputs[inputKey].optionsValues
                        : (MatrixSpecificDataFormInputs[inputKey].optionsValues[
                            specificData.programmingPlanKind
                          ] ?? []),
                      {
                        labels:
                          MatrixSpecificDataFormInputs[inputKey].optionsLabels,
                        defaultLabel:
                          MatrixSpecificDataFormInputs[inputKey]
                            .defaultOptionLabel
                      }
                    )}
                    onChange={(e) =>
                      setSpecificData((prev) => ({
                        ...prev,
                        [inputKey]: e.target.value
                      }))
                    }
                    inputForm={form}
                    inputKey="specificData"
                    inputPathFromKey={[inputKey]}
                    label={
                      MatrixSpecificDataFormInputs[inputKey].label ?? inputKey
                    }
                    whenValid={
                      MatrixSpecificDataFormInputs[inputKey].whenValid ??
                      'Champ correctement renseigné.'
                    }
                    required={requiredInputs.includes(inputKey)}
                    data-testid={MatrixSpecificDataFormInputs[inputKey].testId}
                  />
                </div>
              );

            case 'checkbox':
              return (
                <div
                  className={clsx(
                    cx('fr-col-12', 'fr-col-sm-6', 'fr-mt-2w'),
                    inputProps.classes?.container
                  )}
                >
                  <ToggleSwitch
                    label={
                      MatrixSpecificDataFormInputs[inputKey].label ?? inputKey
                    }
                    checked={Boolean((specificData as any)[inputKey])}
                    onChange={(checked) =>
                      setSpecificData((prev) => ({
                        ...prev,
                        [inputKey]: checked
                      }))
                    }
                    showCheckedHint={false}
                    data-testid={MatrixSpecificDataFormInputs[inputKey].testId}
                  />
                </div>
              );

            case 'radio':
              return (
                <div
                  className={clsx(
                    cx('fr-col-12', 'fr-col-sm-6'),
                    inputProps.classes?.container
                  )}
                >
                  <AppRadioButtons
                    legend={
                      MatrixSpecificDataFormInputs[inputKey].label ?? inputKey
                    }
                    options={
                      selectOptionsFromList(
                        Array.isArray(
                          MatrixSpecificDataFormInputs[inputKey].optionsValues
                        )
                          ? MatrixSpecificDataFormInputs[inputKey].optionsValues
                          : (MatrixSpecificDataFormInputs[inputKey]
                              .optionsValues[
                              specificData.programmingPlanKind
                            ] ?? []),
                        {
                          labels:
                            MatrixSpecificDataFormInputs[inputKey]
                              .optionsLabels,
                          withDefault: false
                        }
                      ).map(({ label, value }) => ({
                        key: `${MatrixSpecificDataFormInputs[inputKey].testId}-option-${value}`,
                        label,
                        nativeInputProps: {
                          checked: (specificData as any)[inputKey] === value,
                          onChange: () =>
                            setSpecificData((prev) => ({
                              ...prev,
                              [inputKey]: value
                            }))
                        }
                      })) ?? []
                    }
                    colSm={MatrixSpecificDataFormInputs[inputKey].colSm}
                    inputForm={form}
                    inputKey="specificData"
                    inputPathFromKey={[inputKey]}
                    required={requiredInputs.includes(inputKey)}
                    data-testid={MatrixSpecificDataFormInputs[inputKey].testId}
                  />
                </div>
              );

            default:
              return null;
          }
        })()}
      </Fragment>
    );

    return (
      <>
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
            .sort((a, b) => a[1].order - b[1].order)
            .map(([inputKey, inputProps]) =>
              renderFormInput({ inputKey, inputProps })
            )}
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
          {(
            Object.entries(
              MatrixSpecificDataForm[specificData.programmingPlanKind]
            ) as [
              SampleMatrixSpecificDataKeys,
              MatrixSpecificDataFormInputProps
            ][]
          )
            .filter(([_, inputProps]) => inputProps.position !== 'pre')
            .sort((a, b) => a[1].order - b[1].order)
            .map(([inputKey, inputProps]) =>
              renderFormInput({ inputKey, inputProps })
            )}

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
