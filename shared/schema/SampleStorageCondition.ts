import { z } from 'zod';

export const SampleStorageCondition = z.enum(['Champ', 'Entrepot', 'Caisse']);

export type SampleStorageCondition = z.infer<typeof SampleStorageCondition>;

export const SampleStorageConditionList: SampleStorageCondition[] = [
  'Champ',
  'Entrepot',
  'Caisse',
];

export const SampleStorageConditionLabels: Record<
  SampleStorageCondition,
  string
> = {
  Champ: 'Au champ',
  Entrepot: 'En entrepot',
  Caisse: 'En caisse',
};
