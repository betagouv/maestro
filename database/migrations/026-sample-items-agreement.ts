import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('sample_items', (table) => {
    table.boolean('owner_agreement');
    table.text('notes_on_owner_agreement');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('sample_items', (table) => {
    table.dropColumn('notes_on_owner_agreement');
    table.dropColumn('owner_agreement');
  });
};
