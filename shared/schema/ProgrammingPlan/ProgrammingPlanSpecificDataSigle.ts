import { z } from 'zod';
import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from '../SachaCommemoratif/SachaCommemoratif';
import { ProgrammingPlanKindWithSacha } from './ProgrammingPlanKind';

export const ProgrammingPlanSpecificDataSigleRecord = z.record(
  ProgrammingPlanKindWithSacha,
  z.object({
    programmingPlanKind: ProgrammingPlanKindWithSacha,
    inDAI: z.boolean(),
    attributes: z.record(
      z.string(),
      z.object({
        attribute: z.string(),
        sachaCommemoratifSigle: CommemoratifSigle,
        values: z.record(z.string(), CommemoratifValueSigle)
      })
    )
  })
);

export type ProgrammingPlanSpecificDataSigleRecord = z.infer<
  typeof ProgrammingPlanSpecificDataSigleRecord
>;
