import { z } from 'zod';
import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from '../SachaCommemoratif/SachaCommemoratif';
import { ProgrammingPlanKindWithSacha } from './ProgrammingPlanKind';

export const ProgrammingPlanSpecificDataAttribute = z.object({
  programmingPlanKind: ProgrammingPlanKindWithSacha,
  attribute: z.string(),
  sachaCommemoratifSigle: CommemoratifSigle,
  inDai: z.boolean()
});

export type ProgrammingPlanSpecificDataAttribute = z.infer<
  typeof ProgrammingPlanSpecificDataAttribute
>;

export const ProgrammingPlanSpecificDataAttributeValue = z.object({
  programmingPlanKind: ProgrammingPlanKindWithSacha,
  attribute: z.string(),
  attributeValue: z.string(),
  sachaCommemoratifValueSigle: CommemoratifValueSigle
});

export type ProgrammingPlanSpecificDataAttributeValue = z.infer<
  typeof ProgrammingPlanSpecificDataAttributeValue
>;

export const ProgrammingPlanSpecificDataRecord = z.record(
  ProgrammingPlanKindWithSacha,
  z.object({
    programmingPlanKind: ProgrammingPlanKindWithSacha,
    attributes: z.record(
      z.string(),
      z.object({
        attribute: z.string(),
        sachaCommemoratifSigle: CommemoratifSigle,
        inDai: z.boolean(),
        values: z.record(z.string(), CommemoratifValueSigle)
      })
    )
  })
);

export type ProgrammingPlanSpecificDataRecord = z.infer<
  typeof ProgrammingPlanSpecificDataRecord
>;
