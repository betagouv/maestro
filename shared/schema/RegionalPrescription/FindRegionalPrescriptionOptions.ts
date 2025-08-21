import { z } from 'zod/v4';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';

export const RegionalPrescriptionOptionsInclude = z.enum([
  'comments',
  'sampleCounts'
]);

export type RegionalPrescriptionOptionsInclude = z.infer<
  typeof RegionalPrescriptionOptionsInclude
>;

export const FindRegionalPrescriptionOptions = z.object({
  programmingPlanId: z.guid(),
  contexts: coerceToArray(z.array(ProgrammingPlanContext)).nullish(),
  region: Region.nullish(),
  includes: z
    .union([
      RegionalPrescriptionOptionsInclude,
      coerceToArray(z.array(RegionalPrescriptionOptionsInclude))
    ])
    .nullish()
});

export type FindRegionalPrescriptionOptions = z.infer<
  typeof FindRegionalPrescriptionOptions
>;
