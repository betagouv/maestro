import Select, { SelectProps } from '@codegouvfr/react-dsfr/Select';
import {
  ComponentPropsWithoutRef,
  InputHTMLAttributes,
  useEffect
} from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import {
  AppSelectOption,
  AppSelectOptionsGroup
} from 'src/components/_app/AppSelect/AppSelectOption';
import { UseForm } from 'src/hooks/useForm';
import { z, ZodObject } from 'zod';

export type AppSelectProps<T extends ZodObject, U extends UseForm<T>> = Partial<
  Pick<ComponentPropsWithoutRef<typeof Select>, 'label' | 'hint'>
> &
  InputHTMLAttributes<HTMLSelectElement> & {
    options?: AppSelectOption[];
    optionsGroups?: AppSelectOptionsGroup[];
    inputForm: U;
    inputKey: keyof NoInfer<z.infer<U['schema']>>;
    inputPathFromKey?: (string | number)[];
    whenValid?: string;
    nativeSelectProps?: SelectProps['nativeSelectProps'] & {
      'data-testid'?: string;
    };
  };

function AppSelect<T extends ZodObject>(props: AppSelectProps<T, UseForm<T>>) {
  const {
    options,
    optionsGroups,
    inputKey,
    inputPathFromKey,
    inputForm,
    whenValid,
    hint,
    nativeSelectProps,
    ...selectProps
  } = props;

  useEffect(() => {
    if (
      options?.length === 1 &&
      options[0].value !== '' &&
      options[0].value !== selectProps.value
    ) {
      const event = {
        target: { value: options[0].value }
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      selectProps.onChange?.(event);
    }
  }, [options, selectProps]);

  return (
    <Select
      {...selectProps}
      label={
        selectProps.label ? (
          <>
            {selectProps.label}
            {selectProps.required && <AppRequiredInput />}
          </>
        ) : (
          ' '
        )
      }
      hint={hint}
      nativeSelectProps={{
        ...selectProps,
        ...nativeSelectProps
      }}
      state={
        selectProps.required
          ? inputForm.messageType(inputKey, inputPathFromKey)
          : inputForm.messageType(inputKey, inputPathFromKey) === 'error'
            ? 'error'
            : 'default'
      }
      stateRelatedMessage={inputForm.message(
        inputKey,
        inputPathFromKey,
        whenValid
      )}
    >
      {options?.map((option) => (
        <option
          label={option.label}
          value={option.value}
          disabled={option.disabled}
          selected={option.selected}
          hidden={option.hidden}
          key={`option_${option.value}`}
        ></option>
      ))}
      {optionsGroups?.map((group) => (
        <optgroup label={group.label} key={`group_${group.label}`}>
          {group.options.map((option) => (
            <option
              label={option.label}
              value={option.value}
              disabled={option.disabled}
              selected={option.selected}
              hidden={option.hidden}
              key={`option_${option.value}`}
            ></option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}

export default AppSelect;
