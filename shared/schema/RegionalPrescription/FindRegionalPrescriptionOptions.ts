import { z } from 'zod';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export const RegionalPrescriptionOptionsInclude = z.enum([
  'comments',
  'sampleCounts'
]);

export type RegionalPrescriptionOptionsInclude = z.infer<
  typeof RegionalPrescriptionOptionsInclude
>;

export const FindRegionalPrescriptionOptions = z.object({
  programmingPlanIds: coerceToArray(z.array(z.guid()).min(1)),
  programmingPlanKinds: coerceToArray(z.array(ProgrammingPlanKind)).nullish(),
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
