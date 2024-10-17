import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.table('analysis_residues', (table) => {
    table.string('original_name');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.table('analysis_residues', (table) => {
    table.dropColumn('original_name');
  });
};
