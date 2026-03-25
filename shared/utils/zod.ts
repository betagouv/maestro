import { z } from 'zod';

// Module augmentation: forbid calling .refine() and .superRefine() directly on
// schemas. Use the wrapper functions below instead.
// This prevents accidentally chaining .pick()/.omit()/.extend() after these
// methods, which silently breaks in Zod v4 (https://github.com/colinhacks/zod/issues/5425).
declare module 'zod' {
  interface ZodType {
    /** @deprecated Use refineSchema() from shared/utils/zod instead */
    refine(...args: unknown[]): never;
    /** @deprecated Use superRefineSchema() from shared/utils/zod instead */
    superRefine(...args: unknown[]): never;
  }
}

type Refined<T> = T & { pick: never; omit: never; extend: never };

export function refineSchema<T extends z.ZodType>(
  schema: T,
  fn: (val: z.output<T>) => unknown,
  params?: string | z.core.$ZodCustomParams
): Refined<T> {
  return (schema as any).refine(fn, params) as Refined<T>;
}

export function superRefineSchema<T extends z.ZodType>(
  schema: T,
  fn: (val: z.output<T>, ctx: z.core.$RefinementCtx<z.output<T>>) => void
): Refined<T> {
  return (schema as any).superRefine(fn) as Refined<T>;
}

export function checkSchema<T extends z.ZodType>(
  schema: T,
  ...checks: (z.core.CheckFn<z.output<T>> | z.core.$ZodCheck<z.output<T>>)[]
): Refined<T> {
  // eslint-disable-next-line no-restricted-syntax
  return (schema as any).check(...checks) as Refined<T>;
}
