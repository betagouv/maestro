import { z } from 'zod';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { Context } from '../ProgrammingPlan/Context';

export const FindRegionalPrescriptionOptionsInclude = z.enum([
  'comments',
  'realizedSampleCount',
]);

export type FindRegionalPrescriptionOptionsInclude = z.infer<
  typeof FindRegionalPrescriptionOptionsInclude
>;

export const FindRegionalPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  context: Context,
  region: Region.nullish(),
  includes: z
    .union([
      FindRegionalPrescriptionOptionsInclude,
      coerceToArray(z.array(FindRegionalPrescriptionOptionsInclude)),
    ])
    .nullish(),
});

export type FindRegionalPrescriptionOptions = z.infer<
  typeof FindRegionalPrescriptionOptions
>;
