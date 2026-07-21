import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';

export const ProgrammingPlanLocalStatus = z.object({
  status: ProgrammingPlanStatus,
  region: Region.nullish(),
  department: Department.nullish(),
  sentAt: z.coerce.date().nullish(),
  lastModifiedAt: z.coerce.date().nullish()
});

export const ProgrammingPlanNationalStatus = ProgrammingPlanLocalStatus.omit({
  region: true,
  department: true
});

export const ProgrammingPlanRegionalStatus = z.object({
  ...ProgrammingPlanLocalStatus.omit({ department: true }).shape,
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
export type ProgrammingPlanNationalStatus = z.infer<
  typeof ProgrammingPlanNationalStatus
>;
export type ProgrammingPlanRegionalStatus = z.infer<
  typeof ProgrammingPlanRegionalStatus
>;
export type ProgrammingPlanDepartmentalStatus = z.infer<
  typeof ProgrammingPlanDepartmentalStatus
>;
