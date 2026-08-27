import z from 'zod';
import { Department } from '../../referential/Department';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { Region } from '../../referential/Region';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';

export const ComplianceStat = z.object({
  region: Region,
  department: Department.optional(),
  matrixKind: MatrixKind.optional().catch(undefined),
  matrix: Matrix.optional().catch(undefined),
  totalCount: z.coerce.number(),
  compliantCount: z.coerce.number().default(0),
  nonCompliantCount: z.coerce.number().default(0)
});

export const FindComplianceStatsOptions = z.object({
  programmingPlanId: z.guid(),
  context: ProgrammingPlanContext.optional(),
  byDepartment: z.coerce.boolean().optional()
});

export type ComplianceStat = z.infer<typeof ComplianceStat>;
export type FindComplianceStatsOptions = z.infer<
  typeof FindComplianceStatsOptions
>;
