import { z } from 'zod';
import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from '../SachaCommemoratif/SachaCommemoratif';

export const SampleSpecificDataAttribute = z.object({
  attribute: z.string(),
  sachaCommemoratifSigle: CommemoratifSigle.nullable(),
  inDai: z.boolean(),
  optional: z.boolean()
});

export type SampleSpecificDataAttribute = z.infer<
  typeof SampleSpecificDataAttribute
>;

export const SampleSpecificDataAttributeValue = z.object({
  attribute: z.string(),
  attributeValue: z.string(),
  sachaCommemoratifValueSigle: CommemoratifValueSigle.nullable()
});

export type SampleSpecificDataAttributeValue = z.infer<
  typeof SampleSpecificDataAttributeValue
>;
