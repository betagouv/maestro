import { z } from 'zod';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { Context } from '../ProgrammingPlan/Context';

export const FindPrescriptionOptionsInclude = z.enum(['comments']);

export type FindPrescriptionOptionsInclude = z.infer<
  typeof FindPrescriptionOptionsInclude
>;

export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  context: Context,
  region: Region.nullish(),
  matrix: z.string().nullish(),
  stage: Stage.nullish(),
  includes: z
    .union([
      z.array(FindPrescriptionOptionsInclude),
      FindPrescriptionOptionsInclude,
    ])
    .nullish(),
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
