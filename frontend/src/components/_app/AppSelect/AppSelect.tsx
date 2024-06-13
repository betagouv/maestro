import Select from '@codegouvfr/react-dsfr/Select';
import { ComponentPropsWithoutRef, InputHTMLAttributes } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequiredInput/AppRequiredInput';
import { AppSelectOption } from 'src/components/_app/AppSelect/AppSelectOption';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';

type AppSelectProps<T extends ZodRawShape> = Partial<
  Pick<ComponentPropsWithoutRef<typeof Select>, 'label'>
> &
  InputHTMLAttributes<HTMLSelectElement> & {
    options: AppSelectOption[];
    inputForm: ReturnType<typeof useForm>;
    inputKey: keyof T;
    inputPathFromKey?: (string | number)[];
    whenValid?: string;
  };

function AppSelect<T extends ZodRawShape>(props: AppSelectProps<T>) {
  const {
    options,
    inputKey,
    inputPathFromKey,
    inputForm,
    whenValid,
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
          ''
        )
      }
      nativeSelectProps={{
        ...selectProps,
      }}
      state={inputForm.messageType(String(inputKey), inputPathFromKey)}
      stateRelatedMessage={inputForm.message(
        String(inputKey),
        inputPathFromKey,
        whenValid
      )}
    >
      {options.map((option) => (
        <option
          label={option.label}
          value={option.value}
          disabled={option.disabled}
          selected={option.selected}
          hidden={option.hidden}
          key={`option_${option.value}`}
        ></option>
      ))}
    </Select>
  );
}

export default AppSelect;
