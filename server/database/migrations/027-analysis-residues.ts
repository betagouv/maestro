import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.text('other_compliance').nullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.dropColumn('other_compliance');
  });
};
