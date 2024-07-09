import { z } from 'zod';

export const ResultKind = z.enum(['Q', 'NQ']);

export type ResultKind = z.infer<typeof ResultKind>;

export const ResultKindList: ResultKind[] = ResultKind.options;

export const ResultKindLabels: Record<ResultKind, string> = {
  Q: 'Valeur numérique',
  NQ: 'Quantifié non détecté',
};
