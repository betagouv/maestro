import { isNil } from 'lodash-es';
import { z } from 'zod';
import { Department } from '../../referential/Department';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { refineSchema } from '../../utils/zod';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingPlanDomainId } from '../ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';

export const PrescriptionOptionsInclude = z.enum(['substanceCount']);

export type PrescriptionOptionsInclude = z.infer<
  typeof PrescriptionOptionsInclude
>;

export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.guid().nullish(),
  programmingPlanIds: z.array(z.guid()).min(1).nullish(),
  year: z.number().int().nullish(),
  programmingSubPlanIds: z.array(ProgrammingSubPlanId).nullish(),
  programmingPlanDomainIds: z.array(ProgrammingPlanDomainId).nullish(),
  contexts: z.array(ProgrammingPlanContext).nullish(),
  matrixKind: z.string().nullish(),
  matrixKinds: z.array(MatrixKind).nullish(),
  subPlanStage: Stage.nullish(),
  coordinatorIds: z.array(z.guid()).nullish(),
  laboratoryIds: z.array(z.guid()).nullish(),
  region: Region.nullish(),
  department: Department.nullish(),
  missingDistribution: z.boolean().nullish(),
  missingLaboratory: z.boolean().nullish(),
  withNovelty: z.boolean().nullish(),
  withSampleCountOnly: z.boolean().nullish(),
  includes: z.array(PrescriptionOptionsInclude).nullish()
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;

export const ExportPrescriptionOptions = refineSchema(
  FindPrescriptionOptions.omit({ includes: true }),
  (options) =>
    !isNil(options.programmingPlanId) ||
    (options.programmingPlanIds ?? []).length > 0,
  { message: 'programmingPlanId ou programmingPlanIds est requis' }
);

export type ExportPrescriptionOptions = z.infer<
  typeof ExportPrescriptionOptions
>;
