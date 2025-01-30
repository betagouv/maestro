import {
  NationalCoordinator,
  RegionalCoordinator,
  RegionalDromCoordinator,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import { Users } from '../../repositories/userRepository';

export const seed = async (): Promise<void> => {
  await Users().insert([
    Sampler1Fixture,
    Sampler2Fixture,
    SamplerDromFixture,
    RegionalCoordinator,
    RegionalDromCoordinator,
    NationalCoordinator
  ]);
};
