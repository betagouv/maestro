import { intersection, isNil } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { type RefinementCtx, z } from 'zod';
import { Department } from '../../referential/Department';
import { Region, RegionList, Regions } from '../../referential/Region';
import { SlaughterhouseStage, Stage } from '../../referential/Stage';
import type { Nullable } from '../../utils/typescript';
import { superRefineSchema } from '../../utils/zod';
import { Company } from '../Company/Company';
import { ProgrammingSubPlan } from '../ProgrammingPlan/ProgrammingSubPlan';
import type { UserPermission } from './UserPermission';
import {
  canHaveDepartment,
  isDepartmentalRole,
  isNationalRole,
  isRegionalRole,
  UserRole,
  UserRolePermissions
} from './UserRole';

export const UserBase = z.object({
  id: z.guid(),
  email: z.email({ error: 'Veuillez renseigner un email valide.' }),
  name: z.string().nullable(),
  stages: z.array(Stage),
  programmingSubPlans: z.array(ProgrammingSubPlan),
  roles: z.array(UserRole).min(1, 'Veuillez renseigner au moins un rôle.'),
  region: Region.nullable(),
  department: Department.nullable(),
  companies: z.array(Company),
  laboratoryId: z.string().nullable(),
  disabled: z.boolean(),
  certified: z.boolean()
});

export const userChecks = <
  T extends Pick<
    UserBase,
    'region' | 'roles' | 'department' | 'stages' | 'companies' | 'laboratoryId'
  >
>(
  user: T,
  ctx: RefinementCtx<T>
) => {
  if (user.stages.length === 0 && stagesIsRequired(user)) {
    ctx.addIssue({
      code: 'custom',
      path: ['stages'],
      message: 'Au moins un stade de prélèvement est obligatoire pour ce rôle.'
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
  if (departmentIsRequired(user) && !user.department) {
    ctx.addIssue({
      code: 'custom',
      path: ['department'],
      message: 'Le département est obligatoire pour ce rôle.'
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

  if (!user.laboratoryId && laboratoryIsRequired(user)) {
    ctx.addIssue({
      code: 'custom',
      path: ['laboratoryId'],
      message: 'Le laboratoire est obligatoire pour ce rôle.'
    });
  }
};

export const UserRefined = superRefineSchema(
  z.object({
    ...UserBase.shape
  }),
  userChecks
);

const UserToSave = z.object(UserBase.shape).omit({
  id: true,
  name: true,
  programmingSubPlans: true,
  certified: true
});

export const UserToCreateRefined = superRefineSchema(UserToSave, userChecks);
export type UserToCreateRefined = z.infer<typeof UserToCreateRefined>;

export const UserToUpdateRefined = superRefineSchema(UserToSave, userChecks);

export type UserToUpdateRefined = z.infer<typeof UserToUpdateRefined>;

export const Sampler = z.object(UserRefined.shape).pick({
  id: true,
  name: true
});

export type UserRefined = z.infer<typeof UserRefined>;
export type UserBase = z.infer<typeof UserBase>;
export type Sampler = z.infer<typeof Sampler>;

export const userRegionsForRole = (
  user: Pick<UserBase, 'region'>,
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
  user: Pick<UserBase, 'region' | 'department'>,
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

const worksInSlaughterhouse = (
  user: Pick<Nullable<UserRefined>, 'stages' | 'roles'>
): boolean =>
  (user.roles?.includes('Sampler') &&
    user.stages?.includes(SlaughterhouseStage)) ??
  false;

export const companiesIsRequired = (
  user: Pick<Nullable<UserRefined>, 'stages' | 'roles'>
): boolean => worksInSlaughterhouse(user);

export const departmentIsRequired = (
  user: Pick<Nullable<UserRefined>, 'stages' | 'roles'>
): boolean =>
  (user.roles?.some((role) => isDepartmentalRole(role)) ||
    worksInSlaughterhouse(user)) ??
  false;

export const stagesIsRequired = (
  user: Pick<Nullable<UserRefined>, 'roles'>
): boolean =>
  !user.roles?.includes('Administrator') &&
  !user.roles?.includes('LaboratoryUser') &&
  !user.roles?.includes('LaboratoryOffice');

export const laboratoryIsRequired = (
  user: Pick<Nullable<UserRefined>, 'roles'>
): boolean => user.roles?.includes('LaboratoryUser') ?? false;

export const certificationIsRequired = (
  user: Pick<Nullable<UserRefined>, 'roles'>
): boolean => user.roles?.length === 1 && user.roles[0] === 'Sampler';

export const canSignIn = (
  user: Pick<UserBase, 'disabled' | 'certified'>
): boolean => !user.disabled && user.certified;
