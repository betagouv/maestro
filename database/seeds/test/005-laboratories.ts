import { Laboratories } from '../../../server/repositories/laboratoryRepository';
import { genLaboratory } from '../../../shared/test/laboratoryFixtures';

export const LaboratoryFixture = genLaboratory({
  id: '11111111-1111-1111-1111-111111111111',
});

exports.seed = async function () {
  await Laboratories().insert([LaboratoryFixture]);
};
