import { z } from 'zod';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { Stage } from '../../referential/Stage';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';

export const PrescriptionCounts = z.object({
  subPlanCount: z.number().int(),
  sampleCount: z.number().int(),
  missingDistributionCount: z.number().int(),
  missingLaboratoryCount: z.number().int(),
  noveltyCount: z.number().int(),
  displayedMissingDistributionCount: z.number().int(),
  displayedDistributedCount: z.number().int(),
  stageCounts: z.array(z.object({ stage: Stage, count: z.number().int() })),
  matrixKinds: z.array(MatrixKind),
  programmingPlanIds: z.array(z.guid()),
  programmingSubPlanIds: z.array(ProgrammingSubPlanId),
  contexts: z.array(ProgrammingPlanContext)
});

export type PrescriptionCounts = z.infer<typeof PrescriptionCounts>;
