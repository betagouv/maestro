import {
  AdminFixture,
  genUser,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalDromCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDaoaFixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import { userRepository } from '../../repositories/userRepository';
import { TEST_LOGGED_SECRET } from '../testUtils';

export const seed = async (): Promise<void> => {
  const users = [
    Sampler1Fixture,
    Sampler2Fixture,
    SamplerDromFixture,
    SamplerDaoaFixture,
    RegionalCoordinator,
    RegionalDromCoordinator,
    NationalCoordinator,
    AdminFixture,
    RegionalObserver,
    NationalObserver,
    genUser({ roles: ['LaboratoryUser'] })
  ].map((u) => ({
    ...u,
    loggedSecrets: [TEST_LOGGED_SECRET]
  }));

  for (const user of users) {
    await userRepository.insert(user);
  }
};
