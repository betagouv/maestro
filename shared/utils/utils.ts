import _ from 'lodash';
import fp from 'lodash/fp';
import { z } from 'zod';

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

export const convertKeysToCamelCase = (obj: any) => {
  const transform = fp.mapKeys((key: string) => _.camelCase(key));
  const deepTransform: any = fp.mapValues((value: any) =>
    _.isPlainObject(value) ? convertKeysToCamelCase(value) : value
  );
  return fp.flow(transform, deepTransform)(obj);
};
