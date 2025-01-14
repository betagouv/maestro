import { Laboratories } from '../../repositories/laboratoryRepository';
import { LaboratoryFixture } from '../../../shared/test/laboratoryFixtures';

export const seed = async (): Promise<void> => {
  await Laboratories().insert([LaboratoryFixture]);
};
