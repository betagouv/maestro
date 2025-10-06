import { z } from 'zod';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export const LocalPrescriptionOptionsInclude = z.enum([
  'comments',
  'sampleCounts'
]);

export type LocalPrescriptionOptionsInclude = z.infer<
  typeof LocalPrescriptionOptionsInclude
>;

export const FindLocalPrescriptionOptions = z.object({
  programmingPlanId: z.guid(),
  programmingPlanKinds: coerceToArray(z.array(ProgrammingPlanKind)).nullish(),
  contexts: coerceToArray(z.array(ProgrammingPlanContext)).nullish(),
  region: Region.nullish(),
  includes: z
    .union([
      LocalPrescriptionOptionsInclude,
      coerceToArray(z.array(LocalPrescriptionOptionsInclude))
    ])
    .nullish()
});

export type FindLocalPrescriptionOptions = z.infer<
  typeof FindLocalPrescriptionOptions
>;
