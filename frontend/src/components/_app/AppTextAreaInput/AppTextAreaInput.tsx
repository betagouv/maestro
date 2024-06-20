import Input from '@codegouvfr/react-dsfr/Input';
import { ComponentPropsWithoutRef, TextareaHTMLAttributes } from 'react';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';

type AppTextInputProps<T extends ZodRawShape> = Partial<
  Pick<
    ComponentPropsWithoutRef<typeof Input>,
    'label' | 'hintText' | 'state' | 'stateRelatedMessage'
  >
> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    inputForm: ReturnType<typeof useForm>;
    inputKey: keyof T;
    inputPathFromKey?: (string | number)[];
    whenValid?: string;
  };

function AppTextAreaInput<T extends ZodRawShape>(props: AppTextInputProps<T>) {
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
      label={textInputProps.label ?? ''}
      textArea
      {...textInputProps}
      nativeTextAreaProps={{
        ...textInputProps,
        placeholder,
      }}
      state={state ?? inputForm.messageType(String(inputKey), inputPathFromKey)}
      stateRelatedMessage={
        stateRelatedMessage ??
        inputForm.message(String(inputKey), inputPathFromKey, whenValid)
      }
      hintText={hintText}
    />
  );
}

export default AppTextAreaInput;
