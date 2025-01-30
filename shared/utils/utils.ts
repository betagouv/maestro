import {
  camelCase,
  chain,
  flow,
  isArray,
  isObject,
  isPlainObject
} from 'lodash-es';
import { z, ZodObject } from 'zod';

export const isDefined = <A>(a: A | undefined): a is A => a !== undefined;

export const isNotNull = <A>(a: A | null): a is A => a !== null;

export const isDefinedAndNotNull = <A>(a: A | null | undefined): a is A =>
  a !== null && a !== undefined;

export const isNotEmpty = <A>(a: any): a is A => Object.keys(a).length !== 0;

export function coerceToArray<Schema extends z.ZodArray<z.ZodTypeAny>>(
  schema: Schema
) {
  return z
    .union([z.any().array(), z.any().transform((x) => x.split(','))])
    .pipe(schema);
}

export const convertKeysToCamelCase = (obj: unknown): unknown => {
  if (!isPlainObject(obj)) {
    return obj;
  }

  const transform = (o: any) =>
    Object.keys(o).reduce(
      (acc, k) => {
        acc[camelCase(k)] = o[k];
        return acc;
      },
      {} as Record<string, unknown>
    );

  const deepTransform = (o: any) =>
    Object.keys(o).reduce(
      (acc, k) => {
        const value = o[k];
        acc[camelCase(k)] = isPlainObject(value)
          ? convertKeysToCamelCase(value)
          : isArray(value)
            ? value.map(convertKeysToCamelCase)
            : value;
        return acc;
      },
      {} as Record<string, unknown>
    );

  return flow(transform, deepTransform)(obj);
};

export function refineObject<T extends ZodObject<any>>(
  schema: T,
  refinement: (data: z.infer<T>) => boolean,
  path: (string | number)[],
  message: string
): T {
  return schema.refine(refinement, {
    path,
    message
  }) as unknown as T;
}

export const objToUrlParams = (obj: any) =>
  new URLSearchParams(
    chain(obj)
      .omitBy((v) => !v)
      .mapValues((o) => (isObject(o) ? JSON.stringify(o) : o))
      .value()
  );
