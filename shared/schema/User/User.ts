import { intersection, isNil } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Department } from '../../referential/Department';
import { RefinementCtx, z } from 'zod';
import { Region, RegionList } from '../../referential/Region';
import { Company } from '../Company/Company';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { UserPermission } from './UserPermission';
import {
  DepartmentalUserRole,
  NationalUserRole,
  RegionalAndNationUserRole,
  RegionalUserRole,
  UserRole,
  UserRolePermissions
} from './UserRole';
import { hasNationalRole, UserRole, UserRolePermissions } from './UserRole';

const BaseUser = z.object({
  id: z.guid(),
  email: z.email({ error: 'Veuillez renseigner un email valide.' }),
  name: z.string().nullable(),
  programmingPlanKinds: z.array(ProgrammingPlanKind),
  role: UserRole,
  region: Region.nullable(),
  department: Department.nullish(),
  company: Company.nullish(),
});

const regionCheck = <T extends Pick<User, 'region' | 'role'>>(
  user: T,
  ctx: RefinementCtx<T>
) => {
  if (!user.region && !hasNationalRole(user)) {
    ctx.addIssue({
      key: 'region',
      path: ['region'],
      code: 'custom',
      message: 'La région est obligatoire pour ce rôle.'
    });
  }
};

export const User = BaseUser.superRefine(regionCheck);

export const UserToCreate = User.omit({ id: true, name: true }).superRefine(
  regionCheck
);
export type UserToCreate = z.infer<typeof UserToCreate>;

export const UserToUpdate = User.omit({ name: true }).superRefine(regionCheck);
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

export const hasPermission = (user: User, ...permissions: UserPermission[]) =>
  intersection(permissions, UserRolePermissions[user.role]).length > 0;

export const hasNationalRole = (user: Pick<User, 'role'>) =>
  NationalUserRole.safeParse(user.role).success ||
  RegionalAndNationUserRole.safeParse(user.role).success;

export const hasRegionalRole = (user: Pick<User, 'role' | 'department'>) =>
  RegionalUserRole.safeParse(user.role).success && isNil(user.department);

export const hasDepartmentalRole = (user: Pick<User, 'role' | 'department'>) =>
  DepartmentalUserRole.safeParse(user.role).success && !isNil(user.department);

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
