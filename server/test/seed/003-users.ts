import {
  AdminFixture,
  NationalCoordinator,
  NationalObserver,
  RegionalCoordinator,
  RegionalDromCoordinator,
  RegionalObserver,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerAndNationalObserver,
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
      AdminFixture,
      RegionalObserver,
      NationalObserver,
      SamplerAndNationalObserver
    ].map((u) => ({
      ...u,
      loggedSecrets: [TEST_LOGGED_SECRET]
    }))
  );
};
