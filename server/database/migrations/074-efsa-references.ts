import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('sacha_residue_mappings', (table) => {
    table.string('label').notNullable();
    table.string('ssd2_id').notNullable();

    table.unique(['label', 'ssd2_id']);

    table.index(['label']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('sacha_residue_mappings');
};
