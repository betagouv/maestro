export const assertUnreachable = (value: never): never => {
  throw new Error("Didn't expect to get here", value);
};

// from https://stackoverflow.com/questions/72789915/typescript-omit-seems-to-transform-an-union-into-an-intersection/72790170#72790170
export type OmitDistributive<T, K extends string> = T extends unknown
  ? Omit<T, K>
  : never;

export const isNotEmpty = <T>(items: T[]): items is [T, ...T[]] =>
  items.length > 0;
