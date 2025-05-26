import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { Laboratories } from '../../repositories/laboratoryRepository';

export const seed = async (): Promise<void> => {
  await Laboratories().insert([LaboratoryFixture]);
};
