import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { ObjectShape } from 'yup/lib/object';
import { isDate } from 'date-fns';

export const emailValidator = yup
  .string()
  .required('Veuillez renseigner votre adresse email.')
  .email("L'adresse doit être un email valide");

export const passwordValidator = yup
  .string()
  .required('Veuillez renseigner votre nouveau mot de passe.')
  .min(8, 'Au moins 8 caractères.')
  .matches(/[A-Z]/g, {
    name: 'uppercase',
    message: 'Au moins une majuscule.',
  })
  .matches(/[a-z]/g, {
    name: 'lowercase',
    message: 'Au moins une minuscule.',
  })
  .matches(/[0-9]/g, {
    name: 'number',
    message: 'Au moins un chiffre.',
  });

export const passwordConfirmationValidator = (ref: string) =>
  yup
    .string()
    .required('Veuillez confirmer votre mot de passe.')
    .oneOf([yup.ref(ref)], 'Les mots de passe doivent être identiques.');

export const fileValidator = (supportedFormats: string[]) =>
  yup
    .mixed()
    .required('Veuillez sélectionner un fichier')
    .test(
      'fileType',
      'Format de fichier invalide',
      (value) => value && supportedFormats.includes(value.type)
    );

type MessageType = 'error' | 'valid' | '';

interface Message {
  text: string;
  type: Omit<MessageType, ''>;
}

export function useForm<
  T extends ObjectShape,
  U extends Record<keyof T, unknown>
>(schema: yup.ObjectSchema<T>, input: U) {
  const [errors, setErrors] = useState<yup.ValidationError>();
  const [isTouched, setIsTouched] = useState(false);

  function error<K extends keyof U>(key?: K): yup.ValidationError | undefined {
    return isTouched && key
      ? errors?.inner.find((error) => error.path === key)
      : errors;
  }

  /**
   * Return all the errors related to a given field.
   * @param key
   */
  function errorList<K extends keyof U>(
    key?: K
  ): yup.ValidationError[] | undefined {
    return isTouched && key
      ? errors?.inner.filter((error) => error.path === key)
      : errors?.inner;
  }

  function hasError<K extends keyof U>(key?: K): boolean {
    return error(key) !== undefined;
  }

  function isValid(): boolean {
    return isTouched && !hasError();
  }

  function labels<K extends keyof U>(key?: K): string[] {
    if (key) {
      return (schema.fields[key] as any).tests.map(
        (test: any) => test.OPTIONS.message
      );
    }
    return Object.values(schema.fields)
      .flatMap((field) => (field as any).tests)
      .map((test) => test.OPTIONS.message);
  }

  function message<K extends keyof U>(
    key: K,
    whenValid?: string
  ): string | undefined {
    return messageType(key) === 'valid' && whenValid
      ? whenValid
      : error(key)?.message;
  }

  /**
   * Return individual messages for a given field.
   * @param key
   */
  function messageList<K extends keyof U>(key: K): Message[] {
    if (!isTouched) {
      return [];
    }

    return labels(key).map((label) => {
      return {
        text: label,
        type: errorList(key)?.find((error) => error.message === label)
          ? 'error'
          : 'valid',
      };
    });
  }

  function messageType<K extends keyof U>(key: K): MessageType {
    if (isTouched) {
      if (hasError(key)) {
        return 'error';
      }
      return 'valid';
    }
    return '';
  }

  async function validate(onValid?: () => void) {
    try {
      setIsTouched(true);
      await schema.validate(input, { abortEarly: false });
      setErrors(undefined);
      onValid?.();
    } catch (errors) {
      setErrors(errors as yup.ValidationError);
    }
  }

  useEffect(() => {
    if (isTouched) {
      if (hasError()) {
        validate();
      }
    } else {
      if (Object.values(input).some((value) => !!value)) {
        if (hasError()) {
          setIsTouched(true);
          validate();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(input)]);

  return {
    isTouched,
    isValid,
    hasError,
    messageList,
    message,
    messageType,
    validate,
  };
}
