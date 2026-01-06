import {
  AdminFixture,
  DepartmentalCoordinator,
  LaboratoryUserFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalDromCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import { userRepository } from '../../repositories/userRepository';
import { TEST_LOGGED_SECRET } from '../testUtils';

export const seed = async (): Promise<void> => {
  const users = [
    Sampler1Fixture,
    Sampler2Fixture,
    SamplerDromFixture,
    DepartmentalCoordinator,
    RegionalCoordinator,
    RegionalDromCoordinator,
    NationalCoordinator,
    AdminFixture,
    RegionalObserver,
    NationalObserver,
    LaboratoryUserFixture
  ].map((u) => ({
    ...u,
    loggedSecrets: [TEST_LOGGED_SECRET]
  }));

  for (const user of users) {
    await userRepository.insert(user);
  }
};
