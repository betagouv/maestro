import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex('sacha_residue_mappings').delete();

  await knex.schema.alterTable('sacha_residue_mappings', (table) => {
    table.dropUnique(['label', 'ssd2_id']);
    table.unique(['label']);
  });
};

export const down = async (knex: Knex) => {
  await knex('sacha_residue_mappings').delete();

  await knex.schema.alterTable('sacha_residue_mappings', (table) => {
    table.dropUnique(['label']);
    table.unique(['label', 'ssd2_id']);
  });
};
