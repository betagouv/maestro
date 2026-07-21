import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';

export const ProgrammingPlanLocalStatus = z.object({
  status: ProgrammingPlanStatus,
  region: Region.nullish(),
  department: Department.nullish()
});

export const ProgrammingPlanRegionalStatus = ProgrammingPlanLocalStatus.omit({
  department: true
}).extend({
  region: Region
});

export const ProgrammingPlanDepartmentalStatus = z.object({
  ...ProgrammingPlanLocalStatus.shape,
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
