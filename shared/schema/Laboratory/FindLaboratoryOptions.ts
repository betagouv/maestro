import { z } from 'zod';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const FindLaboratoryOptions = z.object({
  programmingPlanIds: coerceToArray(z.array(z.guid())).nullish(),
  substanceKind: SubstanceKind.nullish(),
  programmingPlanKind: ProgrammingPlanKind.nullish()
});

export type FindLaboratoryOptions = z.infer<typeof FindLaboratoryOptions>;
