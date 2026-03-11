import { z } from 'zod';

export const SampleStep = z.enum(
  ['Draft', 'DraftMatrix', 'DraftItems', 'Submitted', 'Sent'],
  {
    error: () => 'Statut de saisie non renseigné.'
  }
);

export type SampleStep = z.infer<typeof SampleStep>;

export const SampleSteps: Record<SampleStep, number> = {
  Draft: 1,
  DraftMatrix: 2,
  DraftItems: 3,
  Submitted: 4,
  Sent: 5
};
