import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';
import { z, ZodEffects, ZodObject, ZodRawShape } from 'zod';

type MessageType = 'error' | 'success' | 'default';

export type UseFormShape<T extends ZodRawShape> = UseForm<
  ZodObject<T> | ZodEffects<ZodObject<T>>
>;
export type UseForm<T extends ZodObject<any> | ZodEffects<ZodObject<any>>> =
  ReturnType<typeof useForm<T>>;

export function useForm<
  T extends ZodObject<ZodRawShape> | ZodEffects<ZodObject<ZodRawShape>>,
  U extends object = Record<keyof z.infer<T>, unknown>
>(schema: T, input: U, onInputChange?: () => Promise<void>) {
  const [error, setError] = useState<z.ZodError>();
  const [isTouched, setIsTouched] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  function issue<K extends keyof U>(
    key?: K,
    pathFromKey?: (string | number)[]
  ): z.ZodIssue | undefined {
    return isTouched && key
      ? error?.issues?.find((issue) =>
          isEqual(issue.path, [key, ...(pathFromKey ?? [])])
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

  const validate = async (
    onValid?: (validInput: z.infer<T>) => Promise<void>
  ) => {
    try {
      const validInput: z.infer<T> = await schema.parseAsync(input);
      await onValid?.(validInput);
      setIsTouched(true);
      setError(undefined);
    } catch (error) {
      console.error(error, (error as z.ZodError).issues);
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
    input
  };
}
