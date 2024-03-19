import _ from 'lodash';
import { useEffect, useState } from 'react';
import { z, ZodObject, ZodRawShape } from 'zod';

type MessageType = 'error' | 'success' | 'default';

export function useForm<
  T extends ZodRawShape,
  U extends Record<keyof T, unknown>
>(schema: ZodObject<T>, input: U) {
  const [error, setError] = useState<z.ZodError>();
  const [isTouched, setIsTouched] = useState(false);

  function issue<K extends keyof U>(key?: K): z.ZodIssue | undefined {
    return isTouched && key
      ? error?.issues.find((issue) => _.isEqual(issue.path, [key]))
      : error?.issues[0];
  }

  function hasIssue<K extends keyof U>(key?: K): boolean {
    return issue(key) !== undefined;
  }

  function isValid(): boolean {
    return isTouched && !hasIssue();
  }

  function message<K extends keyof U>(
    key: K,
    whenValid?: string
  ): string | undefined {
    return messageType(key) === 'success' && whenValid
      ? whenValid
      : issue(key)?.message;
  }

  function messageType<K extends keyof U>(key: K): MessageType {
    if (isTouched) {
      if (hasIssue(key)) {
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

  return {
    isTouched,
    isValid,
    hasIssue,
    message,
    messageType,
    validate,
  };
}
