import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';
import type { ProgrammingSubPlanId } from './ProgrammingSubPlan';

const NoneLiteral = z.literal('None');
const ProgrammingSubPlanIdSchema = z
  .guid()
  .transform((value) => value as ProgrammingSubPlanId);

export const ProgrammingPlanLocalStatus = z.object({
  status: ProgrammingPlanStatus,
  region: Region,
  department: Department.nullish()
});

export const ProgrammingPlanRegionalStatus = ProgrammingPlanLocalStatus.omit({
  department: true
});

export const ProgrammingPlanDepartmentalStatus = z.object({
  ...ProgrammingPlanLocalStatus.shape,
  department: Department
});

export const ProgrammingSubPlanLocalStatus = z.object({
  subPlanId: ProgrammingSubPlanIdSchema,
  region: z.union([Region, NoneLiteral]),
  department: z.union([Department, NoneLiteral]),
  status: ProgrammingPlanStatus
});

export const ProgrammingSubPlanNationalStatus =
  ProgrammingSubPlanLocalStatus.extend({
    region: NoneLiteral,
    department: NoneLiteral
  });

export const ProgrammingSubPlanRegionalStatus =
  ProgrammingSubPlanLocalStatus.extend({
    region: Region,
    department: NoneLiteral
  });

export const ProgrammingSubPlanDepartmentalStatus =
  ProgrammingSubPlanLocalStatus.extend({
    region: Region,
    department: Department
  });

export type ProgrammingPlanLocalStatus = z.infer<
  typeof ProgrammingPlanLocalStatus
>;
export type ProgrammingPlanRegionalStatus = z.infer<
  typeof ProgrammingPlanRegionalStatus
>;
export type ProgrammingPlanDepartmentalStatus = z.infer<
  typeof ProgrammingPlanDepartmentalStatus
>;
export type ProgrammingSubPlanLocalStatus = z.infer<
  typeof ProgrammingSubPlanLocalStatus
>;
export type ProgrammingSubPlanNationalStatus = z.infer<
  typeof ProgrammingSubPlanNationalStatus
>;
export type ProgrammingSubPlanRegionalStatus = z.infer<
  typeof ProgrammingSubPlanRegionalStatus
>;
export type ProgrammingSubPlanDepartmentalStatus = z.infer<
  typeof ProgrammingSubPlanDepartmentalStatus
>;
