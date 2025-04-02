import {
  AdminFixture,
  NationalCoordinator,
  RegionalCoordinator,
  RegionalDromCoordinator,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import { Users } from '../../repositories/userRepository';
import { TEST_LOGGED_SECRET } from '../testUtils';

export const seed = async (): Promise<void> => {
  await Users().insert(
    [
      Sampler1Fixture,
      Sampler2Fixture,
      SamplerDromFixture,
      RegionalCoordinator,
      RegionalDromCoordinator,
      NationalCoordinator,
      AdminFixture
    ].map((u) => ({
      ...u,
      loggedSecrets: [TEST_LOGGED_SECRET]
    }))
  );
};
