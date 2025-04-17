import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { RegionList } from '../referential/Region';
import { AuthUser } from '../schema/User/AuthUser';
import { User } from '../schema/User/User';
import { NationalUserRole, UserRoleList } from '../schema/User/UserRole';
import { oneOf } from './testFixtures';

export const genUser = (data?: Partial<User>): User => {
  const role = data?.role ?? oneOf(UserRoleList);
  return {
    id: uuidv4(),
    email: fakerFR.internet.email(),
    firstName: fakerFR.person.firstName(),
    lastName: fakerFR.person.lastName(),
    role,
    region: NationalUserRole.safeParse(role).success ? null : oneOf(RegionList),
    ...data
  };
};

export const Region1Fixture = '44' as const;
export const Region2Fixture = '52' as const;
export const RegionDromFixture = '01' as const;

export const Sampler1Fixture = genUser({
  role: 'Sampler',
  id: '11111111-1111-1111-1111-111111111111',
  region: Region1Fixture,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.net'
});
export const Sampler2Fixture = genUser({
  role: 'Sampler',
  id: '22222222-2222-2222-2222-222222222222',
  region: Region2Fixture,
  firstName: 'Jane',
  lastName: 'Austen',
  email: 'jane.austen@example.net'
});
export const SamplerDromFixture = genUser({
  role: 'Sampler',
  id: '66666666-6666-6666-6666-666666666666',
  region: RegionDromFixture,
  firstName: 'Jack',
  lastName: 'Sparrow',
  email: 'jack.sparrow@example.net'
});
export const RegionalCoordinator = genUser({
  role: 'RegionalCoordinator',
  id: '33333333-3333-3333-3333-333333333333',
  region: Region1Fixture,
  firstName: 'Alice',
  lastName: 'Wonderland',
  email: 'alice.wonderland@example.net'
});
export const RegionalDromCoordinator = genUser({
  role: 'RegionalCoordinator',
  id: '44444444-4444-4444-4444-444444444444',
  region: RegionDromFixture,
  firstName: 'Bob',
  lastName: 'Marley',
  email: 'bob.marley@example.net'
});
export const NationalCoordinator = genUser({
  role: 'NationalCoordinator',
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

export const genAuthUser = (data?: Partial<User>): AuthUser => ({
  user: genUser(data)
});
