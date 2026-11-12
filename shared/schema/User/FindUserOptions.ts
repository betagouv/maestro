import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { maestroDateRefined } from '../../utils/date';
import { UserRole } from './UserRole';

export const FindUserOptions = z.object({
  ids: z.array(z.guid()).nullish(),
  region: Region.nullish(),
  department: Department.nullish(),
  regions: z.array(Region).nullish(),
  departments: z.array(Department).nullish(),
  roles: z.array(UserRole).nullish(),
  stages: z.array(Stage).nullish(),
  companySirets: z.array(z.string()).nullish(),
  disabled: z.boolean().nullish(),
  certified: z.boolean().nullish(),
  createdFrom: maestroDateRefined.nullish(),
  createdTo: maestroDateRefined.nullish(),
  laboratoryIds: z.array(z.string()).nullish()
});

export type FindUserOptions = z.infer<typeof FindUserOptions>;

export const FindUserExportOptions = FindUserOptions.extend({
  label: z.string().nullish()
});

export type FindUserExportOptions = z.infer<typeof FindUserExportOptions>;
