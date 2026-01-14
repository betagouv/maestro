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
  canHaveDepartment,
  isNationalRole,
  isRegionalRole,
  UserRole,
  UserRolePermissions
} from './UserRole';

export const UserBase = z.object({
  id: z.guid(),
  email: z.email({ error: 'Veuillez renseigner un email valide.' }),
  name: z.string().nullable(),
  programmingPlanKinds: z.array(ProgrammingPlanKind),
  region: Region.nullable(),
  department: Department.nullable(),
  companies: z.array(Company),
  disabled: z.boolean()
});

const userChecks = <
  T extends Pick<
    UserRefined,
    'region' | 'roles' | 'department' | 'companies' | 'programmingPlanKinds'
  >
>(
  user: T,
  ctx: RefinementCtx<T>
) => {
  if (
    user.programmingPlanKinds.length === 0 &&
    programmingPlanKindsIsRequired(user)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['programmingPlanKinds'],
      message: 'Au moins un plan est obligatoire pour ce rôle.'
    });
  }
  if (
    !user.region &&
    (user.roles.some((role) => isRegionalRole(role)) || canHaveDepartment(user))
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['region'],
      message: 'La région est obligatoire pour ce rôle.'
    });
  }
  if (user.department && !canHaveDepartment(user)) {
    ctx.addIssue({
      code: 'custom',
      path: ['department'],
      message: 'Ce rôle ne peut pas être lié à un département.'
    });
  }

  if (
    (!user.companies || user.companies.length === 0) &&
    companiesIsRequired(user)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['companies'],
      message: 'Un abattoir est obligatoire pour ce rôle.'
    });
  }
};

export const UserRefined = z
  .object({
    ...UserBase.shape,
    roles: z.array(UserRole).min(1, 'Veuillez renseigner au moins un rôle.')
  })
  .superRefine(userChecks);

export const UserToCreateRefined = z
  .object(UserRefined.shape)
  .omit({
    id: true,
    name: true
  })
  .superRefine(userChecks);
export type UserToCreateRefined = z.infer<typeof UserToCreateRefined>;

export const UserToUpdateRefined = z
  .object(UserRefined.shape)
  .omit({
    name: true
  })
  .superRefine(userChecks);

export type UserToUpdateRefined = z.infer<typeof UserToUpdateRefined>;

export const Sampler = z.object(UserRefined.shape).pick({
  id: true,
  name: true
});

export type UserRefined = z.infer<typeof UserRefined>;
export type UserBase = z.infer<typeof UserBase>;
export type Sampler = z.infer<typeof Sampler>;

export const userRegionsForRole = (
  user: UserBase,
  userRole: UserRole
): Region[] =>
  user
    ? isNationalRole(userRole)
      ? RegionList
      : !isNil(user.region)
        ? [user.region]
        : []
    : [];

export const userDepartmentsForRole = (
  user: UserBase,
  userRole: UserRole
): Department[] =>
  user?.department
    ? [user.department]
    : userRegionsForRole(user, userRole).flatMap(
        (region) => Regions[region].departments
      );

export const hasPermission = (
  userRole: UserRole,
  ...permissions: UserPermission[]
) => intersection(permissions, UserRolePermissions[userRole]).length > 0;

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

export const PPVDummyLaboratoryIds = [
  CAP29Id,
  CER30Id,
  GIR49Id,
  LDA66Id,
  LDA72Id,
  SCL34Id,
  SCL91Id
];

export const companiesIsRequired = (
  user: Pick<Nullable<UserRefined>, 'programmingPlanKinds' | 'roles'>
): boolean =>
  (user.roles?.includes('Sampler') &&
    (user.programmingPlanKinds?.includes('DAOA_BREEDING') ||
      user.programmingPlanKinds?.includes('DAOA_SLAUGHTER'))) ??
  false;

export const programmingPlanKindsIsRequired = (
  user: Pick<Nullable<UserRefined>, 'roles'>
): boolean =>
  !user.roles?.includes('Administrator') &&
  !user.roles?.includes('LaboratoryUser');
