import { z } from 'zod';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { Stage } from '../../referential/Stage';

export const PrescriptionCounts = z.object({
  subPlanCount: z.number().int(),
  sampleCount: z.number().int(),
  missingDistributionCount: z.number().int(),
  missingLaboratoryCount: z.number().int(),
  noveltyCount: z.number().int(),
  distributedCount: z.number().int(),
  stageCounts: z.array(z.object({ stage: Stage, count: z.number().int() })),
  matrixKinds: z.array(MatrixKind)
});

export type PrescriptionCounts = z.infer<typeof PrescriptionCounts>;
