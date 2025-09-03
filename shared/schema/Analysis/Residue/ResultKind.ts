import { z } from 'zod';

export const ResultKind = z.enum(['Q', 'NQ'], {
  error: () => 'Veuillez renseigner le type de résultat.'
});

export type ResultKind = z.infer<typeof ResultKind>;

export const ResultKindList: ResultKind[] = ResultKind.options;

export const ResultKindLabels: Record<ResultKind, string> = {
  Q: 'Valeur numérique',
  NQ: 'Détecté, non quantifié'
};
