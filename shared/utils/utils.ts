import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import _ from 'lodash';
import { camelCase, flow, isArray, isPlainObject } from 'lodash-es';
import { z } from 'zod';

export const isDefined = <A>(a: A | undefined): a is A => a !== undefined;

export const isDefinedAndNotNull = <A>(a: A | null | undefined): a is A =>
  a !== null && a !== undefined;

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

export function withISOStringDates(obj: any): any {
  return _.cloneDeepWith(obj, (value) => {
    if (_.isDate(value)) {
      return value.toISOString();
    }
    return undefined;
  });
}

export const formatWithTz = (date: Date, formatStr: string) =>
  format(toZonedTime(date, 'Europe/Paris'), formatStr, {
    locale: fr
  });
