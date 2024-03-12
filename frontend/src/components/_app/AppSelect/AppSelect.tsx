import Select from '@codegouvfr/react-dsfr/Select';
import { ComponentPropsWithoutRef, InputHTMLAttributes } from 'react';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';
import { AppSelectOption } from 'src/components/_app/AppSelect/AppSelectOption';


type AppSelectProps<T extends ZodRawShape> = Partial<
  Pick<ComponentPropsWithoutRef<typeof Select>, 'label'>
> &
  InputHTMLAttributes<HTMLSelectElement> & {
    options: AppSelectOption[];
    inputForm: ReturnType<typeof useForm>;
    inputKey: keyof T;
    whenValid?: string;
  };

function AppSelect<T extends ZodRawShape>(props: AppSelectProps<T>) {
  const { options, inputKey, inputForm, whenValid, ...selectProps } = props;

  return (
    <Select
      {...selectProps}
      label={selectProps.label}
      nativeSelectProps={{
        ...selectProps,
      }}
      state={inputForm.messageType(String(inputKey))}
      stateRelatedMessage={inputForm.message(String(inputKey), whenValid)}
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
