import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { RegionList, Regions } from '../referential/Region';
import type { ProgrammingSubPlanBase } from '../schema/ProgrammingPlan/ProgrammingSubPlan';
import { AuthUserRefined } from '../schema/User/AuthUser';
import {
  companiesIsRequired,
  departmentIsRequired,
  laboratoryIsRequired,
  programmingSubPlanIdsIsRequired,
  type UserRefined
} from '../schema/User/User';
import {
  canHaveDepartment,
  isRegionalRole,
  type UserRole,
  UserRoleList
} from '../schema/User/UserRole';
import { SlaughterhouseCompanyFixture1 } from './companyFixtures';
import { LaboratoryFixture } from './laboratoryFixtures';
import {
  DAOABovinInProgressSubPlanFixture,
  DAOABovinValidatedSubPlanFixture,
  DAOAVolailleInProgressSubPlanFixture,
  DAOAVolailleValidatedSubPlanFixture,
  genProgrammingSubPlan,
  PPVClosedSubPlanFixture,
  PPVInProgressSubPlanFixture,
  PPVSubmittedSubPlanFixture,
  PPVValidatedDromSubPlanFixture,
  PPVValidatedSubPlanFixture,
  PPVValidatedSubPlanId,
  SachaSubPlanIds
} from './programmingPlanFixtures';
import { oneOf } from './testFixtures';

export const genUser = <T extends Partial<UserRefined>>(
  data: T
): UserRefined & T => {
  const roles = data?.roles ?? [oneOf(UserRoleList)];

  const region =
    roles.some((role) => isRegionalRole(role)) || canHaveDepartment({ roles })
      ? (data?.region ?? oneOf(RegionList))
      : null;

  const programmingSubPlans: ProgrammingSubPlanBase[] =
    programmingSubPlanIdsIsRequired({ roles })
      ? (data?.programmingSubPlans ??
        (roles?.includes('DepartmentalCoordinator')
          ? [genProgrammingSubPlan({ id: oneOf(SachaSubPlanIds) })]
          : [genProgrammingSubPlan({ id: PPVValidatedSubPlanId })]))
      : [];

  return {
    id: uuidv4(),
    email: fakerFR.internet.email().toLowerCase(),
    name: fakerFR.person.fullName(),
    programmingSubPlans,
    roles,
    region,
    department:
      region && departmentIsRequired({ roles, programmingSubPlans })
        ? oneOf(Regions[region].departments)
        : null,
    companies: companiesIsRequired({ roles, programmingSubPlans })
      ? [SlaughterhouseCompanyFixture1]
      : [],
    laboratoryId: laboratoryIsRequired({ roles })
      ? (data?.laboratoryId ?? LaboratoryFixture.id)
      : null,
    disabled: false,
    ...data
  };
};

export const Region1Fixture = '44' as const;
export const Region2Fixture = '52' as const;
export const RegionDromFixture = '01' as const;

export const Sampler1Fixture = genUser({
  roles: ['Sampler'],
  id: '11111111-1111-1111-1111-111111111111',
  programmingSubPlans: [
    PPVValidatedSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVClosedSubPlanFixture,
    PPVSubmittedSubPlanFixture
  ],
  region: Region1Fixture,
  department: null,
  name: 'John Doe',
  email: 'john.doe@example.net'
});
export const Sampler2Fixture = genUser({
  roles: ['Sampler'],
  id: '22222222-2222-2222-2222-222222222222',
  programmingSubPlans: [
    PPVValidatedSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVClosedSubPlanFixture,
    PPVSubmittedSubPlanFixture
  ],
  region: Region2Fixture,
  department: null,
  name: 'Jane Austen',
  email: 'jane.austen@example.net'
});
export const SamplerDromFixture = genUser({
  roles: ['Sampler'],
  id: '66666666-6666-6666-6666-666666666666',
  programmingSubPlans: [
    PPVValidatedDromSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVClosedSubPlanFixture,
    PPVSubmittedSubPlanFixture
  ],
  region: RegionDromFixture,
  department: null,
  name: 'Jack Sparrow',
  email: 'jack.sparrow@example.net'
});
export const RegionalCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '33333333-3333-3333-3333-333333333333',
  programmingSubPlans: [
    PPVValidatedSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVClosedSubPlanFixture,
    PPVSubmittedSubPlanFixture
  ],
  region: Region1Fixture,
  name: 'Alice Wonderland',
  email: 'alice.wonderland@example.net'
});
export const RegionalDromCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '44444444-4444-4444-4444-444444444444',
  programmingSubPlans: [
    PPVValidatedDromSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVClosedSubPlanFixture,
    PPVSubmittedSubPlanFixture
  ],
  region: RegionDromFixture,
  name: 'Bob Marley',
  email: 'bob.marley@example.net'
});
export const NationalCoordinator = genUser({
  roles: ['NationalCoordinator'],
  programmingSubPlans: [
    PPVValidatedSubPlanFixture,
    PPVValidatedDromSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVClosedSubPlanFixture,
    PPVSubmittedSubPlanFixture
  ],
  id: '55555555-5555-5555-5555-555555555555'
});
export const AdminFixture = genUser({
  roles: ['Administrator'],
  id: '77777777-7777-7777-7777-777777777777'
});
export const RegionalObserver = genUser({
  roles: ['RegionalObserver'],
  id: '88888888-8888-8888-8888-888888888888',
  programmingSubPlans: [
    PPVValidatedSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVClosedSubPlanFixture,
    PPVSubmittedSubPlanFixture
  ],
  region: Region1Fixture
});
export const NationalObserver = genUser({
  roles: ['NationalObserver'],
  programmingSubPlans: [
    PPVValidatedSubPlanFixture,
    PPVInProgressSubPlanFixture,
    PPVClosedSubPlanFixture,
    PPVSubmittedSubPlanFixture
  ],
  id: '99999999-9999-9999-9999-999999999999'
});
export const DepartmentalCoordinator = genUser({
  roles: ['DepartmentalCoordinator'],
  id: '12121212-1212-1212-1212-121212121212',
  programmingSubPlans: [
    DAOAVolailleInProgressSubPlanFixture,
    DAOABovinInProgressSubPlanFixture,
    DAOAVolailleValidatedSubPlanFixture,
    DAOABovinValidatedSubPlanFixture
  ],
  region: Region1Fixture,
  department: Regions[Region1Fixture].departments[0]
});
export const SamplerDaoaFixture = genUser({
  roles: ['Sampler'],
  id: '13131313-1313-1313-1313-131313131313',
  programmingSubPlans: [
    DAOAVolailleInProgressSubPlanFixture,
    DAOABovinInProgressSubPlanFixture,
    DAOAVolailleValidatedSubPlanFixture,
    DAOABovinValidatedSubPlanFixture
  ],
  region: Region2Fixture,
  department: '85',
  companies: [SlaughterhouseCompanyFixture1]
});
export const NationalCoordinatorDaoaFixture = genUser({
  roles: ['NationalCoordinator'],
  programmingSubPlans: [
    DAOAVolailleInProgressSubPlanFixture,
    DAOABovinInProgressSubPlanFixture,
    DAOAVolailleValidatedSubPlanFixture,
    DAOABovinValidatedSubPlanFixture
  ],
  id: '14141414-1414-1414-1414-141414141414'
});
export const LaboratoryUserFixture = genUser({
  roles: ['LaboratoryUser'],
  id: '15151515-1515-1515-1515-151515151515',
  laboratoryId: LaboratoryFixture.id
});
export const LaboratoryOfficeUserFixture = genUser({
  roles: ['LaboratoryOffice'],
  id: '16161616-1616-1616-1616-161616161616'
});

export const genAuthUser = (
  data?: Partial<UserRefined & { userRole: UserRole }>
): AuthUserRefined => {
  const role = data?.userRole ?? data?.roles?.[0] ?? oneOf(UserRoleList);
  return AuthUserRefined.parse({
    user: genUser({
      ...data,
      roles: data?.roles ?? [role]
    }),
    userRole: role
  });
};
