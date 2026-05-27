import z from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { Region } from '../../referential/Region';

export const ComplianceStat = z.object({
  region: Region,
  matrixKind: MatrixKind,
  matrix: Matrix,
  totalCount: z.coerce.number(),
  compliantCount: z.coerce.number().default(0),
  nonCompliantCount: z.coerce.number().default(0)
});

export const FindComplianceStatsOptions = z.object({
  programmingPlanId: z.guid()
});

export type ComplianceStat = z.infer<typeof ComplianceStat>;
export type FindComplianceStatsOptions = z.infer<
  typeof FindComplianceStatsOptions
>;
