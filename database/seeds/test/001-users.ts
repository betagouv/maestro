import { Users } from '../../../server/repositories/userRepository';
import { Region } from '../../../shared/referential/Region';
import { genUser } from '../../../shared/test/userFixtures';

export const Region1Fixture = '44' as Region;
export const Region2Fixture = '52' as Region;

export const Sampler1Fixture = genUser({
  roles: ['Sampler'],
  id: '11111111-1111-1111-1111-111111111111',
  region: Region1Fixture,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.net',
});
export const Sampler2Fixture = genUser({
  roles: ['Sampler'],
  id: '22222222-2222-2222-2222-222222222222',
  region: Region2Fixture,
  firstName: 'Jane',
  lastName: 'Austen',
  email: 'jane.austen@example.net',
});

export const RegionalCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  id: '33333333-3333-3333-3333-333333333333',
  region: Region1Fixture,
  firstName: 'Alice',
  lastName: 'Wonderland',
  email: 'alice.wonderland@example.net',
});
export const NationalCoordinator = genUser({
  roles: ['NationalCoordinator'],
  id: '44444444-4444-4444-4444-444444444444',
});

exports.seed = async function () {
  await Users().insert([
    Sampler1Fixture,
    Sampler2Fixture,
    RegionalCoordinator,
    NationalCoordinator,
  ]);
};
