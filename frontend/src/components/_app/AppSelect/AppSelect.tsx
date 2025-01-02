import Select from '@codegouvfr/react-dsfr/Select';
import { ComponentPropsWithoutRef, InputHTMLAttributes } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import {
  AppSelectOption,
  AppSelectOptionsGroup
} from 'src/components/_app/AppSelect/AppSelectOption';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';

type AppSelectProps<T extends ZodRawShape> = Partial<
  Pick<ComponentPropsWithoutRef<typeof Select>, 'label' | 'hint'>
> &
  InputHTMLAttributes<HTMLSelectElement> & {
    options?: AppSelectOption[];
    optionsGroups?: AppSelectOptionsGroup[];
    inputForm: ReturnType<typeof useForm>;
    inputKey: keyof T;
    inputPathFromKey?: (string | number)[];
    whenValid?: string;
  };

function AppSelect<T extends ZodRawShape>(props: AppSelectProps<T>) {
  const {
    options,
    optionsGroups,
    inputKey,
    inputPathFromKey,
    inputForm,
    whenValid,
    hint,
    ...selectProps
  } = props;

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
        ...selectProps
      }}
      state={
        selectProps.required
          ? inputForm.messageType(String(inputKey), inputPathFromKey)
          : inputForm.messageType(String(inputKey), inputPathFromKey) ===
              'error'
            ? 'error'
            : 'default'
      }
      stateRelatedMessage={inputForm.message(
        String(inputKey),
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
