import { camelCase, flow, isArray, isPlainObject } from 'lodash-es';

export const isDefined = <A>(a: A | undefined): a is A => a !== undefined;

export const isDefinedAndNotNull = <A>(a: A | null | undefined): a is A =>
  a !== null && a !== undefined;

export function toArray<T>(value?: T | T[]): T[] | undefined {
  return Array.isArray(value) ? value : value ? [value] : undefined;
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
