import Input from '@codegouvfr/react-dsfr/Input';
import { ComponentPropsWithoutRef, InputHTMLAttributes } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequiredInput/AppRequiredInput';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';

type AppTextInputProps<T extends ZodRawShape> = Partial<
  Pick<
    ComponentPropsWithoutRef<typeof Input>,
    'label' | 'hintText' | 'state' | 'stateRelatedMessage'
  >
> &
  InputHTMLAttributes<HTMLInputElement> & {
    inputForm: ReturnType<typeof useForm>;
    inputKey: keyof T;
    inputPathFromKey?: (string | number)[];
    whenValid?: string;
  };

function AppTextInput<T extends ZodRawShape>(props: AppTextInputProps<T>) {
  const {
    inputKey,
    inputPathFromKey,
    inputForm,
    whenValid,
    placeholder,
    hintText,
    state,
    stateRelatedMessage,
    ...textInputProps
  } = props;

  return (
    <Input
      {...textInputProps}
      label={
        textInputProps.label ? (
          <>
            {textInputProps.label}
            {textInputProps.required && <AppRequiredInput />}
          </>
        ) : (
          ''
        )
      }
      nativeInputProps={{
        ...textInputProps,
        placeholder,
      }}
      hintText={hintText}
      state={state ?? inputForm.messageType(String(inputKey), inputPathFromKey)}
      stateRelatedMessage={
        stateRelatedMessage ??
        inputForm.message(String(inputKey), inputPathFromKey, whenValid)
      }
    />
  );
}

export default AppTextInput;
