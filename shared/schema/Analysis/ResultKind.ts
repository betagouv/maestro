import { z } from 'zod';

export const ResultKind = z.enum(['Simple', 'Complexe']);

export type ResultKind = z.infer<typeof ResultKind>;

export const ResultKindList: ResultKind[] = ResultKind.options;
