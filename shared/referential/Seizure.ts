import { z } from 'zod';

export const Seizure = z.enum(['EMPTY', 'PARTIAL', 'TOTAL'], {
  errorMap: () => ({
    message: 'Veuillez renseigner la saisie.'
  })
});

export type Seizure = z.infer<typeof Seizure>;

export const SeizureList = Seizure.options;

export const SeizureLabels: Record<Seizure, string> = {
  EMPTY: 'Absence',
  PARTIAL: 'Partielle',
  TOTAL: 'Totale'
};
