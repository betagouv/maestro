import { Laboratories } from '../../../server/repositories/laboratoryRepository';
import { genLaboratory } from '../../../shared/test/laboratoryFixtures';
import { Knex } from 'knex';
import { setKnexInstance } from '../../../server/repositories/db';

export const LaboratoryFixture = genLaboratory({
  id: '11111111-1111-1111-1111-111111111111',
});

exports.seed = async function (knex: Knex) {
  setKnexInstance(knex)

  await Laboratories().insert([LaboratoryFixture]);
};
