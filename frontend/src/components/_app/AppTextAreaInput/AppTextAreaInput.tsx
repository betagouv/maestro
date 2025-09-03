import Input from '@codegouvfr/react-dsfr/Input';
import { ComponentPropsWithoutRef, TextareaHTMLAttributes } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { UseForm } from 'src/hooks/useForm';
import { z, ZodObject } from 'zod';

type AppTextInputProps<T extends ZodObject, U extends UseForm<T>> = Partial<
  Pick<
    ComponentPropsWithoutRef<typeof Input>,
    'label' | 'hintText' | 'state' | 'stateRelatedMessage'
  >
> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    inputForm: U;
    inputKey: keyof NoInfer<z.infer<U['schema']>>;
    inputPathFromKey?: (string | number)[];
    whenValid?: string;
  };

function AppTextAreaInput<T extends ZodObject>(
  props: AppTextInputProps<T, UseForm<T>>
) {
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
          ' '
        )
      }
      textArea
      nativeTextAreaProps={{
        rows: 3,
        ...textInputProps,
        placeholder
      }}
      hintText={hintText}
      state={
        (state ?? textInputProps.required)
          ? inputForm.messageType(inputKey, inputPathFromKey)
          : inputForm.messageType(inputKey, inputPathFromKey) === 'error'
            ? 'error'
            : 'default'
      }
      stateRelatedMessage={
        stateRelatedMessage ??
        inputForm.message(inputKey, inputPathFromKey, whenValid)
      }
    />
  );
}

export default AppTextAreaInput;
