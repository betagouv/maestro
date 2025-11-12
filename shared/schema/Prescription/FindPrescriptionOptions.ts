import { z } from 'zod';
import { Stage } from '../../referential/Stage';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export const PrescriptionOptionsInclude = z.enum(['substanceCount']);

export type PrescriptionOptionsInclude = z.infer<
  typeof PrescriptionOptionsInclude
>;

export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.guid(),
  programmingPlanKinds: coerceToArray(z.array(ProgrammingPlanKind)).nullish(),
  contexts: coerceToArray(z.array(ProgrammingPlanContext)).nullish(),
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
