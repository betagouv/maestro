import { fakerFR } from '@faker-js/faker';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { Region, RegionList } from '../referential/Region';
import { AuthUser } from '../schema/User/AuthUser';
import { User } from '../schema/User/User';
import { UserRoleList } from '../schema/User/UserRole';
import { oneOf } from './testFixtures';

export const genUser = (data?: Partial<User>): User => {
  const roles = data?.roles ?? [oneOf(UserRoleList)];
  return {
    id: uuidv4(),
    email: fakerFR.internet.email(),
    firstName: fakerFR.person.firstName(),
    lastName: fakerFR.person.lastName(),
    roles,
    region:
      roles?.includes('NationalCoordinator') || roles?.includes('Administrator')
        ? null
        : oneOf(RegionList),
    ...data
  };
};

export const Region1Fixture = '44' as Region;
export const Region2Fixture = '52' as Region;
export const RegionDromFixture = '01' as Region;

export const Sampler1Fixture = genUser({
  roles: ['Sampler'],
  id: '11111111-1111-1111-1111-111111111111',
  region: Region1Fixture,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.net'
});
export const Sampler2Fixture = genUser({
  roles: ['Sampler'],
  id: '22222222-2222-2222-2222-222222222222',
  region: Region2Fixture,
  firstName: 'Jane',
  lastName: 'Austen',
  email: 'jane.austen@example.net'
});
export const SamplerDromFixture = genUser({
  roles: ['Sampler'],
  id: '66666666-6666-6666-6666-666666666666',
  region: RegionDromFixture,
  firstName: 'Jack',
  lastName: 'Sparrow',
  email: 'jack.sparrow@example.net'
});
export const RegionalCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '33333333-3333-3333-3333-333333333333',
  region: Region1Fixture,
  firstName: 'Alice',
  lastName: 'Wonderland',
  email: 'alice.wonderland@example.net'
});
export const RegionalDromCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '44444444-4444-4444-4444-444444444444',
  region: RegionDromFixture,
  firstName: 'Bob',
  lastName: 'Marley',
  email: 'bob.marley@example.net'
});
export const NationalCoordinator = genUser({
  roles: ['NationalCoordinator'],
  id: '55555555-5555-5555-5555-555555555555'
});

export function genAuthUser(): AuthUser {
  return {
    accessToken: randomstring.generate(),
    userId: uuidv4()
  };
}
