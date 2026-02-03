import { z } from 'zod';
import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from '../SachaCommemoratif/SachaCommemoratif';

export const SampleSpecificDataAttribute = z.object({
  attribute: z.string(),
  sachaCommemoratifSigle: CommemoratifSigle.nullable(),
  inDai: z.boolean()
});

export type SampleSpecificDataAttribute = z.infer<
  typeof SampleSpecificDataAttribute
>;

export const SampleSpecificDataAttributeValue = z.object({
  attribute: z.string(),
  attributeValue: z.string(),
  sachaCommemoratifValueSigle: CommemoratifValueSigle
});

export type SampleSpecificDataAttributeValue = z.infer<
  typeof SampleSpecificDataAttributeValue
>;

export const SampleSpecificDataRecord = z.record(
  z.string(),
  z.object({
    attribute: z.string(),
    sachaCommemoratifSigle: CommemoratifSigle.nullable(),
    inDai: z.boolean(),
    values: z.record(z.string(), CommemoratifValueSigle)
  })
);

export type SampleSpecificDataRecord = z.infer<typeof SampleSpecificDataRecord>;
