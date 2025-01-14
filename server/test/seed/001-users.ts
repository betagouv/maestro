import { Users } from '../../repositories/userRepository';
import {
  NationalCoordinator,
  RegionalCoordinator,
  RegionalDromCoordinator,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDromFixture
} from '../../../shared/test/userFixtures';

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
