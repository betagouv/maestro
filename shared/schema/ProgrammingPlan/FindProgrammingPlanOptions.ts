import { intersection } from 'lodash-es';
import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import type { Laboratory } from '../Laboratory/Laboratory';
import { hasPermission, type UserRefined } from '../User/User';
import {
  isNationalRole,
  isRegionalRole,
  type UserRole
} from '../User/UserRole';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindList
} from './ProgrammingPlanKind';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusList,
  ProgrammingPlanStatusPermissions
} from './ProgrammingPlanStatus';
export const FindProgrammingPlanOptions = z.object({
  ids: coerceToArray(z.array(z.string().guid())).nullish(),
  kinds: coerceToArray(z.array(ProgrammingPlanKind)).nullish(),
  year: z.coerce.number().int().nullish(),
  status: coerceToArray(z.array(ProgrammingPlanStatus)).nullish(),
  region: Region.nullish(),
  department: Department.nullish()
});

export type FindProgrammingPlanOptions = z.infer<
  typeof FindProgrammingPlanOptions
>;

export const buildFindProgrammingPlanOptions = (
  user: UserRefined,
  userRole: UserRole,
  findOptions: Partial<FindProgrammingPlanOptions>,
  userLaboratory?: Laboratory
): FindProgrammingPlanOptions => {
  const userStatusAuthorized = Object.entries(ProgrammingPlanStatusPermissions)
    .filter(([, permission]) => hasPermission(userRole, permission))
    .map(([status]) => status);

  const findOptionsStatus = findOptions.status
    ? findOptions.status
    : ProgrammingPlanStatusList;

  return {
    ...findOptions,
    ids: userLaboratory?.programmingPlanIds,
    status: intersection(
      findOptionsStatus,
      userStatusAuthorized
    ) as ProgrammingPlanStatus[],
    kinds: ['Administrator', 'LaboratoryUser'].includes(userRole)
      ? ProgrammingPlanKindList
      : user.programmingPlanKinds,
    region: isNationalRole(userRole) ? findOptions.region : user.region,
    department:
      isNationalRole(userRole) || isRegionalRole(userRole)
        ? findOptions.department
        : user.department
  } as FindProgrammingPlanOptions;
};
