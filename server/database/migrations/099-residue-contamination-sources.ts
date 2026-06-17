import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.specificType('contamination_sources', 'text[]').defaultTo('{}');
    table.text('notes_on_contamination_sources').nullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.dropColumn('contamination_sources');
    table.dropColumn('notes_on_contamination_sources');
  });
};
