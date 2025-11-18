import { intersection, isNil } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { RefinementCtx, z } from 'zod';
import { Department } from '../../referential/Department';
import { Region, RegionList, Regions } from '../../referential/Region';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { UserPermission } from './UserPermission';

import { Nullable } from '../../utils/typescript';
import { Company } from '../Company/Company';
import {
  hasDepartmentalRole,
  hasNationalRole,
  hasRegionalRole,
  UserRole,
  UserRolePermissions
} from './UserRole';

const BaseUser = z.object({
  id: z.guid(),
  email: z.email({ error: 'Veuillez renseigner un email valide.' }),
  name: z.string().nullable(),
  programmingPlanKinds: z.array(ProgrammingPlanKind).min(1),
  role: UserRole,
  region: Region.nullable(),
  department: Department.nullable(),
  companies: z.array(Company).nullable(),
  disabled: z.boolean()
});

const userChecks = <
  T extends Pick<
    User,
    'region' | 'role' | 'department' | 'programmingPlanKinds'
  > & {
    companies: unknown[] | null;
  }
>(
  user: T,
  ctx: RefinementCtx<T>
) => {
  if (!user.region && hasRegionalRole(user)) {
    ctx.addIssue({
      code: 'custom',
      message: 'La région est obligatoire pour ce rôle.'
    });
  }
  if (!user.department && hasDepartmentalRole(user)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Le departement est obligatoire pour ce rôle.'
    });
  }
  // if (
  //   (!user.companies || user.companies.length === 0) &&
  //   companiesIsRequired(user)
  // ) {
  //   ctx.addIssue({
  //     code: 'custom',
  //     message: 'Un abattoir est obligatoire pour ce rôle.'
  //   });
  // }
};

export const User = BaseUser.superRefine(userChecks);

export const UserToCreate = BaseUser.omit({
  id: true,
  name: true
}).superRefine(userChecks);
export type UserToCreate = z.infer<typeof UserToCreate>;

export const UserToUpdate = BaseUser.omit({
  name: true
}).superRefine(userChecks);
export type UserToUpdate = z.infer<typeof UserToUpdate>;

export const Sampler = BaseUser.pick({
  id: true,
  name: true
});

export type User = z.infer<typeof User>;
export type Sampler = z.infer<typeof Sampler>;

export const userRegions = (user?: User): Region[] =>
  user
    ? hasNationalRole(user)
      ? RegionList
      : !isNil(user.region)
        ? [user.region]
        : []
    : [];

export const userDepartments = (user?: User): Department[] =>
  user?.department
    ? [user.department]
    : userRegions(user).flatMap((region) => Regions[region].departments);

export const hasPermission = (user: User, ...permissions: UserPermission[]) =>
  intersection(permissions, UserRolePermissions[user.role]).length > 0;

export const ANS94ALnrEtmId = uuidv4();
export const ANS94ALnrPestId = uuidv4();
export const CAP29Id = uuidv4();
export const CER30Id = uuidv4();
export const GIR49Id = uuidv4();
export const LDA17Id = uuidv4();
export const LDA21Id = uuidv4();
export const LDA22Id = uuidv4();
export const LDA31Id = uuidv4();
export const LDA66Id = uuidv4();
export const LDA72Id = uuidv4();
export const LDA85Id = uuidv4();
export const LDA87Id = uuidv4();
export const SCL34Id = uuidv4();
export const SCL91Id = uuidv4();

export const DummyLaboratoryIds = [
  ANS94ALnrEtmId,
  ANS94ALnrPestId,
  CAP29Id,
  CER30Id,
  GIR49Id,
  LDA17Id,
  LDA21Id,
  LDA22Id,
  LDA31Id,
  LDA66Id,
  LDA72Id,
  LDA85Id,
  LDA87Id,
  SCL34Id,
  SCL91Id
];

export const companiesIsRequired = (
  user: Pick<Nullable<User>, 'programmingPlanKinds' | 'role'>
): boolean =>
  user.role === 'DepartmentalSampler' &&
  (user.programmingPlanKinds?.includes('DAOA_BREEDING') ||
    user.programmingPlanKinds?.includes('DAOA_SLAUGHTER') ||
    false);
