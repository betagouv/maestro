import Input from '@codegouvfr/react-dsfr/Input';
import {
  ComponentPropsWithoutRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';

type AppTextInputProps<T extends ZodRawShape> = Partial<
  Pick<
    ComponentPropsWithoutRef<typeof Input>,
    'label' | 'textArea' | 'hintText' | 'state' | 'stateRelatedMessage'
  >
> &
  InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    inputForm: ReturnType<typeof useForm>;
    inputKey: keyof T;
    inputPathFromKey?: (string | number)[];
    whenValid?: string;
  };

function AppTextInput<T extends ZodRawShape>(props: AppTextInputProps<T>) {
  const {
    textArea,
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
    <>
      {textArea ? (
        <Input
          label={textInputProps.label ?? ''}
          textArea
          {...textInputProps}
          nativeTextAreaProps={{
            ...textInputProps,
            placeholder,
          }}
          state={
            state ?? inputForm.messageType(String(inputKey), inputPathFromKey)
          }
          stateRelatedMessage={
            stateRelatedMessage ??
            inputForm.message(String(inputKey), inputPathFromKey, whenValid)
          }
        />
      ) : (
        <Input
          label={textInputProps.label ?? ''}
          {...textInputProps}
          nativeInputProps={{
            ...textInputProps,
            placeholder,
          }}
          hintText={hintText}
          state={
            state ?? inputForm.messageType(String(inputKey), inputPathFromKey)
          }
          stateRelatedMessage={
            stateRelatedMessage ??
            inputForm.message(String(inputKey), inputPathFromKey, whenValid)
          }
        />
      )}
    </>
  );
}

export default AppTextInput;
