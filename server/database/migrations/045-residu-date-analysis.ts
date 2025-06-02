import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) =>
    table.specificType('analysis_date', 'timestamptz')
  );
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.dropColumn('analysis_date');
  });
};
