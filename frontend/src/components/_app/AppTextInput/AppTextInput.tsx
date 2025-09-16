import Input from '@codegouvfr/react-dsfr/Input';
import { isNil } from 'lodash-es';
import { ComponentPropsWithoutRef, InputHTMLAttributes } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { UseForm } from 'src/hooks/useForm';
import { z, ZodObject } from 'zod';

type AppTextInputProps<T extends ZodObject, U extends UseForm<T>> = Partial<
  Pick<
    ComponentPropsWithoutRef<typeof Input>,
    'label' | 'hintText' | 'state' | 'stateRelatedMessage'
  >
> &
  InputHTMLAttributes<HTMLInputElement> & {
    inputForm: U;
    inputKey: keyof NoInfer<z.infer<U['schema']>>;
    inputPathFromKey?: (string | number)[];
    whenValid?: string;
  };

function AppTextInput<T extends ZodObject>(
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);

    if (!isNil(props.max) && newValue > Number(props.max)) {
      e.currentTarget.value = props.max.toString();
    }

    textInputProps.onChange?.(e);
  };

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
      nativeInputProps={{
        ...textInputProps,
        placeholder,
        onChange: handleChange
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

export default AppTextInput;
