import { intersection } from 'lodash-es';
import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import type { Laboratory } from '../Laboratory/Laboratory';
import {
  hasPermission,
  programmingSubPlansAreRestricted,
  stagesIsRequired,
  type UserRefined
} from '../User/User';
import {
  isNationalRole,
  isRegionalRole,
  type UserRole
} from '../User/UserRole';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusList,
  ProgrammingPlanStatusPermissions
} from './ProgrammingPlanStatus';
import { ProgrammingSubPlanId } from './ProgrammingSubPlan';

export const FindProgrammingPlanOptions = z.object({
  ids: z.array(z.string().guid()).nullish(),
  subPlanIds: z.array(ProgrammingSubPlanId).nullish(),
  year: z.number().int().nullish(),
  status: z.array(ProgrammingPlanStatus).nullish(),
  region: Region.nullish(),
  department: Department.nullish(),
  scope: z.enum(['owned']).nullish(),
  launchedOnly: z.boolean().nullish()
});

export type FindProgrammingPlanOptions = z.infer<
  typeof FindProgrammingPlanOptions
>;

export const FindProgrammingPlanQuery = FindProgrammingPlanOptions.omit({
  subPlanIds: true
});

export type FindProgrammingPlanQuery = z.infer<typeof FindProgrammingPlanQuery>;

export const buildFindProgrammingPlanOptions = (
  user: UserRefined,
  userRole: UserRole,
  findOptions: Partial<FindProgrammingPlanQuery>,
  userLaboratory?: Laboratory
): FindProgrammingPlanOptions => {
  const userStatusAuthorized = Object.entries(ProgrammingPlanStatusPermissions)
    .filter(([, permission]) => hasPermission(userRole, permission))
    .map(([status]) => status);

  const findOptionsStatus = findOptions.status
    ? findOptions.status
    : ProgrammingPlanStatusList;

  const isUnrestricted =
    findOptions.scope === 'owned'
      ? !programmingSubPlansAreRestricted({ roles: [userRole] })
      : !stagesIsRequired({ roles: [userRole] });

  return {
    ...findOptions,
    ids: userLaboratory?.programmingPlanIds,
    status: intersection(
      findOptionsStatus,
      userStatusAuthorized
    ) as ProgrammingPlanStatus[],
    subPlanIds: isUnrestricted
      ? undefined
      : user.programmingSubPlans.map((sp) => sp.id),
    launchedOnly: userRole === 'Sampler',
    region: isNationalRole(userRole) ? findOptions.region : user.region,
    department:
      isNationalRole(userRole) || isRegionalRole(userRole)
        ? findOptions.department
        : user.department
  } as FindProgrammingPlanOptions;
};
