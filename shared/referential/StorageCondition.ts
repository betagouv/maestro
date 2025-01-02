import { z } from 'zod';
export const StorageCondition = z.enum(['STOCK1', 'STOCK2']);
export type StorageCondition = z.infer<typeof StorageCondition>;

export const StorageConditionList: StorageCondition[] =
  StorageCondition.options;

export const StorageConditionLabels: Record<StorageCondition, string> = {
  STOCK1: 'Vrac',
  STOCK2: 'Emballé et conditionné'
};
