import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { RegionList, Regions } from '../referential/Region';
import {
  type ProgrammingSubPlan,
  ProgrammingSubPlanId
} from '../schema/ProgrammingPlan/ProgrammingSubPlan';
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
import { oneOf } from './testFixtures';

export const genProgrammingSubPlan = (
  id: ProgrammingSubPlanId
): ProgrammingSubPlan => ({
  id,
  programmingPlanId: uuidv4(),
  codeNat: 'TEST',
  stages: [],
  label: 'Test SubPlan',
  withSacha: false
});

// Local sub-plan IDs — must match programmingPlanFixtures constants
const PPVSubPlanIdLocal = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'
);
const PPVInProgressSubPlanIdLocal = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3'
);
const PPVClosedSubPlanIdLocal = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2'
);

// Extra PPV sub-plan IDs for router test plans (must match TestPPVSubPlanId* in programmingPlanFixtures)
const TestPPVSubPlanIdLocal1 = ProgrammingSubPlanId.parse(
  'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d1'
);
const TestPPVSubPlanIdLocal2 = ProgrammingSubPlanId.parse(
  'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d2'
);
const TestPPVSubPlanIdLocal3 = ProgrammingSubPlanId.parse(
  'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d3'
);
const TestPPVSubPlanIdLocal4 = ProgrammingSubPlanId.parse(
  'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4'
);
const PPVRouterTestSubPlanIds = [
  TestPPVSubPlanIdLocal1,
  TestPPVSubPlanIdLocal2,
  TestPPVSubPlanIdLocal3,
  TestPPVSubPlanIdLocal4
];

// Stable sub-plan IDs for localPrescription.router.test.ts plans
export const LocalPrescriptionTestSubPlanId1 = ProgrammingSubPlanId.parse(
  'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e1'
);
export const LocalPrescriptionTestSubPlanId2 = ProgrammingSubPlanId.parse(
  'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e2'
);
export const LocalPrescriptionTestSubPlanId3 = ProgrammingSubPlanId.parse(
  'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e3'
);

// All PPV sub-plan IDs (all years) for PPV users
const AllPPVSubPlanIds = [
  PPVSubPlanIdLocal,
  PPVInProgressSubPlanIdLocal,
  PPVClosedSubPlanIdLocal,
  ...PPVRouterTestSubPlanIds,
  LocalPrescriptionTestSubPlanId1,
  LocalPrescriptionTestSubPlanId2,
  LocalPrescriptionTestSubPlanId3
];
const DAOAVolailleSubPlanIdLocal = ProgrammingSubPlanId.parse(
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'
);
const DAOABovinSubPlanIdLocal = ProgrammingSubPlanId.parse(
  'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3'
);
const DAOAInProgressVolailleSubPlanIdLocal = ProgrammingSubPlanId.parse(
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b4'
);
const DAOAInProgressBovinSubPlanIdLocal = ProgrammingSubPlanId.parse(
  'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c4'
);

const SachaSubPlanIds = [
  DAOAVolailleSubPlanIdLocal,
  DAOABovinSubPlanIdLocal,
  DAOAInProgressVolailleSubPlanIdLocal,
  DAOAInProgressBovinSubPlanIdLocal
];

export const genUser = <T extends Partial<UserRefined>>(
  data: T
): UserRefined & T => {
  const roles = data?.roles ?? [oneOf(UserRoleList)];

  const region =
    roles.some((role) => isRegionalRole(role)) || canHaveDepartment({ roles })
      ? (data?.region ?? oneOf(RegionList))
      : null;

  const programmingSubPlans: ProgrammingSubPlan[] =
    programmingSubPlanIdsIsRequired({ roles })
      ? (data?.programmingSubPlans ??
        (roles?.includes('DepartmentalCoordinator')
          ? [genProgrammingSubPlan(oneOf(SachaSubPlanIds))]
          : [genProgrammingSubPlan(PPVSubPlanIdLocal)]))
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
  programmingSubPlans: AllPPVSubPlanIds.map(genProgrammingSubPlan),
  region: Region1Fixture,
  department: null,
  name: 'John Doe',
  email: 'john.doe@example.net'
});
export const Sampler2Fixture = genUser({
  roles: ['Sampler'],
  id: '22222222-2222-2222-2222-222222222222',
  programmingSubPlans: AllPPVSubPlanIds.map(genProgrammingSubPlan),
  region: Region2Fixture,
  department: null,
  name: 'Jane Austen',
  email: 'jane.austen@example.net'
});
export const SamplerDromFixture = genUser({
  roles: ['Sampler'],
  id: '66666666-6666-6666-6666-666666666666',
  programmingSubPlans: AllPPVSubPlanIds.map(genProgrammingSubPlan),
  region: RegionDromFixture,
  department: null,
  name: 'Jack Sparrow',
  email: 'jack.sparrow@example.net'
});
export const RegionalCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '33333333-3333-3333-3333-333333333333',
  programmingSubPlans: AllPPVSubPlanIds.map(genProgrammingSubPlan),
  region: Region1Fixture,
  name: 'Alice Wonderland',
  email: 'alice.wonderland@example.net'
});
export const RegionalDromCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '44444444-4444-4444-4444-444444444444',
  programmingSubPlans: AllPPVSubPlanIds.map(genProgrammingSubPlan),
  region: RegionDromFixture,
  name: 'Bob Marley',
  email: 'bob.marley@example.net'
});
export const NationalCoordinator = genUser({
  roles: ['NationalCoordinator'],
  programmingSubPlans: AllPPVSubPlanIds.map(genProgrammingSubPlan),
  id: '55555555-5555-5555-5555-555555555555'
});
export const AdminFixture = genUser({
  roles: ['Administrator'],
  id: '77777777-7777-7777-7777-777777777777'
});
export const RegionalObserver = genUser({
  roles: ['RegionalObserver'],
  id: '88888888-8888-8888-8888-888888888888',
  programmingSubPlans: AllPPVSubPlanIds.map(genProgrammingSubPlan),
  region: Region1Fixture
});
export const NationalObserver = genUser({
  roles: ['NationalObserver'],
  programmingSubPlans: AllPPVSubPlanIds.map(genProgrammingSubPlan),
  id: '99999999-9999-9999-9999-999999999999'
});
export const DepartmentalCoordinator = genUser({
  roles: ['DepartmentalCoordinator'],
  id: '12121212-1212-1212-1212-121212121212',
  programmingSubPlans: SachaSubPlanIds.map(genProgrammingSubPlan),
  region: Region1Fixture,
  department: Regions[Region1Fixture].departments[0]
});
export const SamplerDaoaFixture = genUser({
  roles: ['Sampler'],
  id: '13131313-1313-1313-1313-131313131313',
  programmingSubPlans: SachaSubPlanIds.map(genProgrammingSubPlan),
  region: Region2Fixture,
  department: '85',
  companies: [SlaughterhouseCompanyFixture1]
});
export const NationalCoordinatorDaoaFixture = genUser({
  roles: ['NationalCoordinator'],
  programmingSubPlans: [
    DAOAVolailleSubPlanIdLocal,
    DAOABovinSubPlanIdLocal
  ].map(genProgrammingSubPlan),
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
