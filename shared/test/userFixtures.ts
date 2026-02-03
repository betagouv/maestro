import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { RegionList, Regions } from '../referential/Region';
import {
  ProgrammingPlanKindList,
  ProgrammingPlanKindWithSachaList
} from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { AuthUserRefined } from '../schema/User/AuthUser';
import {
  companiesIsRequired,
  departmentIsRequired,
  programmingPlanKindsIsRequired,
  UserRefined
} from '../schema/User/User';
import {
  canHaveDepartment,
  isRegionalRole,
  UserRole,
  UserRoleList
} from '../schema/User/UserRole';
import { SlaughterhouseCompanyFixture1 } from './companyFixtures';
import { oneOf } from './testFixtures';

export const genUser = <T extends Partial<UserRefined>>(
  data: T
): UserRefined & T => {
  const roles = data?.roles ?? [oneOf(UserRoleList)];

  const region =
    roles.some((role) => isRegionalRole(role)) || canHaveDepartment({ roles })
      ? (data?.region ?? oneOf(RegionList))
      : null;

  const programmingPlanKinds = programmingPlanKindsIsRequired({ roles })
    ? (data?.programmingPlanKinds ??
      (roles?.includes('DepartmentalCoordinator')
        ? [oneOf(ProgrammingPlanKindWithSachaList)]
        : [oneOf(ProgrammingPlanKindList)]))
    : [];
  return {
    id: uuidv4(),
    email: fakerFR.internet.email().toLowerCase(),
    name: fakerFR.person.fullName(),
    programmingPlanKinds,
    roles,
    region,
    department:
      region && departmentIsRequired({ programmingPlanKinds, roles })
        ? oneOf(Regions[region].departments)
        : null,
    companies: companiesIsRequired({
      programmingPlanKinds,
      roles
    })
      ? [SlaughterhouseCompanyFixture1]
      : [],
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
  programmingPlanKinds: ['PPV'],
  region: Region1Fixture,
  department: null,
  name: 'John Doe',
  email: 'john.doe@example.net'
});
export const Sampler2Fixture = genUser({
  roles: ['Sampler'],
  id: '22222222-2222-2222-2222-222222222222',
  programmingPlanKinds: ['PPV'],
  region: Region2Fixture,
  department: null,
  name: 'Jane Austen',
  email: 'jane.austen@example.net'
});
export const SamplerDromFixture = genUser({
  roles: ['Sampler'],
  id: '66666666-6666-6666-6666-666666666666',
  programmingPlanKinds: ['PPV'],
  region: RegionDromFixture,
  department: null,
  name: 'Jack Sparrow',
  email: 'jack.sparrow@example.net'
});
export const RegionalCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '33333333-3333-3333-3333-333333333333',
  programmingPlanKinds: ['PPV'],
  region: Region1Fixture,
  name: 'Alice Wonderland',
  email: 'alice.wonderland@example.net'
});
export const RegionalDromCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '44444444-4444-4444-4444-444444444444',
  programmingPlanKinds: ['PPV'],
  region: RegionDromFixture,
  name: 'Bob Marley',
  email: 'bob.marley@example.net'
});
export const NationalCoordinator = genUser({
  roles: ['NationalCoordinator'],
  programmingPlanKinds: ['PPV'],
  id: '55555555-5555-5555-5555-555555555555'
});
export const AdminFixture = genUser({
  roles: ['Administrator'],
  id: '77777777-7777-7777-7777-777777777777'
});
export const RegionalObserver = genUser({
  roles: ['RegionalObserver'],
  id: '88888888-8888-8888-8888-888888888888',
  region: Region1Fixture
});
export const NationalObserver = genUser({
  roles: ['NationalObserver'],
  id: '99999999-9999-9999-9999-999999999999'
});
export const DepartmentalCoordinator = genUser({
  roles: ['DepartmentalCoordinator'],
  id: '12121212-1212-1212-1212-121212121212',
  programmingPlanKinds: ProgrammingPlanKindWithSachaList,
  region: Region1Fixture,
  department: Regions[Region1Fixture].departments[0]
});
export const SamplerDaoaFixture = genUser({
  roles: ['Sampler'],
  id: '13131313-1313-1313-1313-131313131313',
  programmingPlanKinds: ProgrammingPlanKindWithSachaList,
  region: Region1Fixture,
  department: Regions[Region1Fixture].departments[0]
});
export const NationalCoordinatorDaoaFixture = genUser({
  roles: ['NationalCoordinator'],
  programmingPlanKinds: ['DAOA_BREEDING', 'DAOA_SLAUGHTER'],
  id: '14141414-1414-1414-1414-141414141414'
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
