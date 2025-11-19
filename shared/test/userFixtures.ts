import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { RegionList, Regions } from '../referential/Region';
import { ProgrammingPlanKindList } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { AuthUser } from '../schema/User/AuthUser';
import { companiesIsRequired, User } from '../schema/User/User';
import {
  canHaveDepartement,
  hasRegionalRole,
  UserRoleList
} from '../schema/User/UserRole';
import { SlaughterhouseCompanyFixture1 } from './companyFixtures';
import { oneOf } from './testFixtures';

export const genUser = <T extends Partial<User>>(data: T): User & T => {
  const role = data?.role ?? oneOf(UserRoleList);

  const region =
    hasRegionalRole({ role }) || canHaveDepartement({ role })
      ? oneOf(RegionList)
      : null;

  const programmingPlanKind = oneOf(ProgrammingPlanKindList);
  return {
    id: uuidv4(),
    email: fakerFR.internet.email(),
    name: fakerFR.person.fullName(),
    programmingPlanKinds: [programmingPlanKind],
    role,
    region,
    department:
      region && canHaveDepartement({ role }) && fakerFR.datatype.boolean()
        ? oneOf(Regions[region].departments)
        : null,
    companies: companiesIsRequired({
      programmingPlanKinds: [programmingPlanKind],
      role
    })
      ? [SlaughterhouseCompanyFixture1]
      : [],
    disabled: false,
    ...data
  };
};

export const Region1Fixture = '44' as const;
export const Region2Fixture = '52' as const;
const RegionDromFixture = '01' as const;

export const Sampler1Fixture = genUser({
  role: 'Sampler',
  id: '11111111-1111-1111-1111-111111111111',
  programmingPlanKinds: ['PPV'],
  region: Region1Fixture,
  name: 'John Doe',
  email: 'john.doe@example.net'
});
export const Sampler2Fixture = genUser({
  role: 'Sampler',
  id: '22222222-2222-2222-2222-222222222222',
  programmingPlanKinds: ['PPV'],
  region: Region2Fixture,
  name: 'Jane Austen',
  email: 'jane.austen@example.net'
});
export const SamplerDromFixture = genUser({
  role: 'Sampler',
  id: '66666666-6666-6666-6666-666666666666',
  programmingPlanKinds: ['PPV'],
  region: RegionDromFixture,
  name: 'Jack Sparrow',
  email: 'jack.sparrow@example.net'
});
export const RegionalCoordinator = genUser({
  role: 'RegionalCoordinator',
  id: '33333333-3333-3333-3333-333333333333',
  programmingPlanKinds: ['PPV'],
  region: Region1Fixture,
  name: 'Alice Wonderland',
  email: 'alice.wonderland@example.net'
});
export const RegionalDromCoordinator = genUser({
  role: 'RegionalCoordinator',
  id: '44444444-4444-4444-4444-444444444444',
  programmingPlanKinds: ['PPV'],
  region: RegionDromFixture,
  name: 'Bob Marley',
  email: 'bob.marley@example.net'
});
export const NationalCoordinator = genUser({
  role: 'NationalCoordinator',
  programmingPlanKinds: ['PPV'],
  id: '55555555-5555-5555-5555-555555555555'
});
export const AdminFixture = genUser({
  role: 'Administrator',
  id: '77777777-7777-7777-7777-777777777777'
});
export const RegionalObserver = genUser({
  role: 'RegionalObserver',
  id: '88888888-8888-8888-8888-888888888888',
  region: Region1Fixture
});
export const NationalObserver = genUser({
  role: 'NationalObserver',
  id: '99999999-9999-9999-9999-999999999999'
});
export const SamplerAndNationalObserver = genUser({
  role: 'SamplerAndNationalObserver',
  id: '10101010-1010-1010-1010-101010101010',
  region: Region1Fixture
});
export const DepartmentalCoordinator = genUser({
  role: 'DepartmentalCoordinator',
  id: '12121212-1212-1212-1212-121212121212',
  programmingPlanKinds: ['DAOA_SLAUGHTER', 'DAOA_BREEDING'],
  region: Region1Fixture,
  department: Regions[Region1Fixture].departments[0]
});
export const SamplerDaoaFixture = genUser({
  role: 'Sampler',
  id: '13131313-1313-1313-1313-131313131313',
  programmingPlanKinds: ['DAOA_SLAUGHTER', 'DAOA_BREEDING'],
  region: Region1Fixture,
  department: Regions[Region1Fixture].departments[0]
});

export const genAuthUser = (data?: Partial<User>): AuthUser => ({
  user: genUser(data ?? {})
});
