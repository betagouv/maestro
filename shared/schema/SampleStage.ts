import { z } from 'zod';

export const SampleStage = z.enum(
  ['Avant récolte', 'Post récolte', 'Stockage', 'Autre'],
  {
    errorMap: () => ({
      message: 'Veuillez renseigner le stade de prélèvement.',
    }),
  }
);

export type SampleStage = z.infer<typeof SampleStage>;

export const SampleStageList: SampleStage[] = [
  'Avant récolte',
  'Post récolte',
  'Stockage',
  'Autre',
];
