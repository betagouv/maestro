import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('documents', (table) => {
    table.string('name');
    table.text('notes');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('documents', (table) => {
    table.dropColumn('name');
    table.dropColumn('notes');
  });
};
