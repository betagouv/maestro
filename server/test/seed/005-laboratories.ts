import { genLaboratory } from '../../../shared/test/laboratoryFixtures';
import { Laboratories } from '../../repositories/laboratoryRepository';

export const LaboratoryFixture = genLaboratory({
  id: '11111111-1111-1111-1111-111111111111'
});

export const seed = async (): Promise<void> => {
  await Laboratories().insert([LaboratoryFixture]);
};
