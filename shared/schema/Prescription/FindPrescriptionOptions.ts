import { z } from 'zod';
import { Stage } from '../../referential/Stage';
import { coerceToArray } from '../../utils/utils';
import { Context } from '../ProgrammingPlan/Context';

export const PrescriptionOptionsInclude = z.enum(['substanceCount']);

export type PrescriptionOptionsInclude = z.infer<
  typeof PrescriptionOptionsInclude
>;

export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  context: Context,
  matrixKind: z.string().nullish(),
  stage: Stage.nullish(),
  includes: z
    .union([
      PrescriptionOptionsInclude,
      coerceToArray(z.array(PrescriptionOptionsInclude))
    ])
    .nullish()
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
