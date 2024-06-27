import _ from 'lodash';
import { useEffect, useState } from 'react';
import { z, ZodEffects, ZodObject, ZodRawShape } from 'zod';

type MessageType = 'error' | 'success' | 'default';

export function useForm<
  T extends ZodRawShape,
  U extends Record<keyof T, unknown>
>(
  schema: ZodObject<T> | ZodEffects<ZodObject<any>>,
  input: U,
  onInputChange?: () => Promise<void>
) {
  const [error, setError] = useState<z.ZodError>();
  const [isTouched, setIsTouched] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  function issue<K extends keyof U>(
    key?: K,
    pathFromKey?: (string | number)[]
  ): z.ZodIssue | undefined {
    return isTouched && key
      ? error?.issues?.find((issue) =>
          _.isEqual(issue.path, [key, ...(pathFromKey ?? [])])
        )
      : error?.issues[0];
  }

  function hasIssue<K extends keyof U>(
    key?: K,
    pathFromKey?: (string | number)[]
  ): boolean {
    return issue(key, pathFromKey) !== undefined;
  }

  function isValid(): boolean {
    return isTouched && !hasIssue();
  }

  function message<K extends keyof U>(
    key: K,
    pathFromKey?: (string | number)[],
    whenValid?: string
  ): string | undefined {
    return messageType(key, pathFromKey) === 'success' && whenValid
      ? whenValid
      : issue(key, pathFromKey)?.message;
  }

  function messageType<K extends keyof U>(
    key: K,
    pathFromKey?: (string | number)[]
  ): MessageType {
    if (isTouched) {
      if (hasIssue(key, pathFromKey)) {
        return 'error';
      }
      return 'success';
    }
    return 'default';
  }

  const validate = async (onValid?: () => Promise<void>) => {
    try {
      await schema.parseAsync(input);
      await onValid?.();
      setIsTouched(true);
      setError(undefined);
    } catch (error) {
      console.error(error);
      setIsTouched(true);
      setError(error as z.ZodError);
    }
  };

  const reset = () => {
    setTimeout(() => {
      setIsTouched(false);
      setError(undefined);
    }, 1);
  };

  useEffect(() => {
    (async () => {
      if (isTouched) {
        await validate();
      } else {
        if (Object.values(input).some((value) => !!value)) {
          if (hasIssue()) {
            setIsTouched(true);
            await validate();
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(input)]);

  useEffect(() => {
    if (isInitialized) {
      (async () => await onInputChange?.())();
    }
    setIsInitialized(true);
  }, [...Object.values(input)]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isTouched,
    isValid,
    hasIssue,
    message,
    messageType,
    reset,
    validate,
  };
}
