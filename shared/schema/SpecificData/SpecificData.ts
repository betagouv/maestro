import { z } from 'zod';

export const UnknownValue = 'Unknown';
export const UnknownValueLabel = 'Je ne sais pas';

export const SpecificData = z.record(z.string(), z.unknown());

export type SpecificData = z.infer<typeof SpecificData>;
