import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  PartialSampleMatrixSpecificData,
  SampleMatrixSpecificData
} from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { Fragment, useMemo } from 'react';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { z, ZodObject } from 'zod';
import { JSONSchema } from 'zod/v4/core/json-schema';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import { UseForm } from '../../../../hooks/useForm';
import { MatrixSpecificDataFormInputProps } from './MatrixSpecificDataForm';
import {
  MatrixSpecificDataFormInputs,
  SampleMatrixSpecificDataKeys
} from './MatrixSpecificDataFormInputs';

type Props<T extends ZodObject, U extends UseForm<T>> = {
  specificData: PartialSampleMatrixSpecificData;
  onChange: (specificData: PartialSampleMatrixSpecificData) => void;
  inputKey: SampleMatrixSpecificDataKeys;
  inputProps: MatrixSpecificDataFormInputProps;
  inputForm: U;
};

function MatrixSpecificDataFormInput<T extends ZodObject>(
  props: Props<T, UseForm<T>>
) {
  const { specificData, onChange, inputKey, inputProps, inputForm } = props;

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
      )?.required ?? [],
    [specificData.programmingPlanKind]
  );

  return (
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
              <div
                className={clsx(
                  cx('fr-col-12', 'fr-col-sm-6'),
                  inputProps.classes?.container
                )}
              >
                <AppTextInput
                  defaultValue={(specificData as any)[inputKey] ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...specificData,
                      [inputKey]: e.target.value
                    })
                  }
                  inputForm={inputForm}
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
                    onChange({
                      ...specificData,
                      [inputKey]: e.target.value
                    })
                  }
                  inputForm={inputForm}
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
                    onChange({
                      ...specificData,
                      [inputKey]: e.target.value
                    })
                  }
                  inputForm={inputForm}
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
                    onChange({
                      ...specificData,
                      [inputKey]: e.target.value
                    })
                  }
                  inputForm={inputForm}
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
                    onChange({
                      ...specificData,
                      [inputKey]: checked
                    })
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
                        : (MatrixSpecificDataFormInputs[inputKey].optionsValues[
                            specificData.programmingPlanKind
                          ] ?? []),
                      {
                        labels:
                          MatrixSpecificDataFormInputs[inputKey].optionsLabels,
                        withDefault: false
                      }
                    ).map(({ label, value }) => ({
                      key: `${MatrixSpecificDataFormInputs[inputKey].testId}-option-${value}`,
                      label,
                      nativeInputProps: {
                        checked: (specificData as any)[inputKey] === value,
                        onChange: () =>
                          onChange({
                            ...specificData,
                            [inputKey]: value
                          })
                      }
                    })) ?? []
                  }
                  colSm={MatrixSpecificDataFormInputs[inputKey].colSm}
                  inputForm={inputForm}
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
}

export default MatrixSpecificDataFormInput;
