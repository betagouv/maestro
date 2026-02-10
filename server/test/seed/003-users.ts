import {
  AdminFixture,
  DepartmentalCoordinator,
  LaboratoryUserFixture,
  NationalCoordinator,
  NationalCoordinatorDaoaFixture,
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
    DepartmentalCoordinator,
    RegionalCoordinator,
    RegionalDromCoordinator,
    NationalCoordinator,
    AdminFixture,
    RegionalObserver,
    NationalObserver,
    NationalCoordinatorDaoaFixture,
    LaboratoryUserFixture
  ].map((u) => ({
    ...u,
    loggedSecrets: [TEST_LOGGED_SECRET]
  }));

  for (const user of users) {
    await userRepository.insert(user);
  }
};
