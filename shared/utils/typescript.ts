export const assertUnreachable = (value: never): never => {
  throw new Error("Didn't expect to get here", value);
};

// from https://stackoverflow.com/questions/72789915/typescript-omit-seems-to-transform-an-union-into-an-intersection/72790170#72790170
export type OmitDistributive<T, K extends string> = T extends unknown
  ? Omit<T, K>
  : never;

export const getRecordKeys = <T extends string>(
  record: Record<T, unknown>
): T[] => Object.keys(record) as T[];

type NonEmptyArray<T> = [T, ...T[]];
export const isNotEmpty = <T>(array: T[]): array is NonEmptyArray<T> =>
  array.length > 0;

export const mapNonEmptyArray = <T, U>(
  nonEmptyArray: NonEmptyArray<T>,
  func: (item: T) => U
): NonEmptyArray<U> => {
  return nonEmptyArray.map(func) as NonEmptyArray<U>;
};
