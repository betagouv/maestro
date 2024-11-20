import { z } from 'zod';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { Context } from '../ProgrammingPlan/Context';

export const RegionalPrescriptionOptionsInclude = z.enum([
  'comments',
  'realizedSampleCount',
]);

export type RegionalPrescriptionOptionsInclude = z.infer<
  typeof RegionalPrescriptionOptionsInclude
>;

export const FindRegionalPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  context: Context,
  region: Region.nullish(),
  includes: z
    .union([
      RegionalPrescriptionOptionsInclude,
      coerceToArray(z.array(RegionalPrescriptionOptionsInclude)),
    ])
    .nullish(),
});

export type FindRegionalPrescriptionOptions = z.infer<
  typeof FindRegionalPrescriptionOptions
>;
