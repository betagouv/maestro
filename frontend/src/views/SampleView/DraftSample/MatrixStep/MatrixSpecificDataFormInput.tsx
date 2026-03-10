import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import { MatrixSpecificDataFormInputProps } from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataForm';
import {
  PartialSampleMatrixSpecificData,
  UnknownValue,
  UnknownValueLabel
} from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { PlanKindFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { Fragment, useMemo } from 'react';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { ZodObject } from 'zod';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import { UseForm } from '../../../../hooks/useForm';

type Props<T extends ZodObject, U extends UseForm<T>> = {
  specificData: PartialSampleMatrixSpecificData;
  onChange: (specificData: PartialSampleMatrixSpecificData) => void;
  fieldConfig: PlanKindFieldConfig;
  inputProps: MatrixSpecificDataFormInputProps;
  inputForm: U;
};

function MatrixSpecificDataFormInput<T extends ZodObject>(
  props: Props<T, UseForm<T>>
) {
  const { specificData, onChange, fieldConfig, inputProps, inputForm } = props;
  const { field, required } = fieldConfig;
  const inputKey = field.key;

  const label = useMemo(
    () => inputProps.label ?? field.label,
    [inputProps.label, field.label]
  );

  const sortedOptions = useMemo(
    () => [...field.options].sort((a, b) => a.order - b.order),
    [field.options]
  );

  const optionValues = useMemo(
    () => sortedOptions.map((o) => o.value),
    [sortedOptions]
  );

  const optionLabels = useMemo(
    () => Object.fromEntries(sortedOptions.map((o) => [o.value, o.label])),
    [sortedOptions]
  );

  const testId = useMemo(() => {
    const key = inputKey.toLowerCase();
    const suffix =
      field.inputType === 'select' || field.inputType === 'selectWithUnknown'
        ? 'select'
        : field.inputType === 'radio'
          ? 'radio'
          : 'input';
    return `${key}-${suffix}`;
  }, [inputKey, field.inputType]);

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
        switch (field.inputType) {
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
                  label={label}
                  hintText={field.hintText ?? undefined}
                  whenValid={field.whenValid}
                  required={required}
                  data-testid={testId}
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
                  label={label}
                  hintText={field.hintText ?? undefined}
                  whenValid={field.whenValid}
                  required={required}
                  min={0}
                  data-testid={testId}
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
                  label={label}
                  hintText={field.hintText ?? undefined}
                  whenValid={field.whenValid}
                  required={required}
                  rows={3}
                  data-testid={testId}
                />
              </div>
            );

          case 'select':
          case 'selectWithUnknown':
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
                    field.inputType === 'selectWithUnknown'
                      ? [...optionValues, UnknownValue]
                      : optionValues,
                    {
                      labels:
                        field.inputType === 'selectWithUnknown'
                          ? {
                              ...optionLabels,
                              [UnknownValue]: UnknownValueLabel
                            }
                          : optionLabels,
                      defaultLabel: field.defaultOptionLabel ?? undefined,
                      withDefault: 'auto'
                    }
                  )}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if ((specificData as any)[inputKey] !== newValue) {
                      onChange({
                        ...specificData,
                        [inputKey]: newValue === '' ? null : newValue
                      });
                    }
                  }}
                  inputForm={inputForm}
                  inputKey="specificData"
                  inputPathFromKey={[inputKey]}
                  label={label}
                  whenValid={field.whenValid}
                  required={required}
                  data-testid={testId}
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
                  label={label}
                  checked={Boolean((specificData as any)[inputKey])}
                  onChange={(checked) =>
                    onChange({
                      ...specificData,
                      [inputKey]: checked
                    })
                  }
                  showCheckedHint={false}
                  data-testid={testId}
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
                  legend={label}
                  options={
                    selectOptionsFromList(optionValues, {
                      labels: optionLabels,
                      withDefault: false
                    }).map(({ label, value }) => ({
                      key: `${testId}-option-${value}`,
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
                  colSm={inputProps.colSm}
                  inputForm={inputForm}
                  inputKey="specificData"
                  inputPathFromKey={[inputKey]}
                  required={required}
                  data-testid={testId}
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
