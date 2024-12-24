import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('substances', (table) => {
    table.string('code').primary();
    table.text('label').notNullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('substances');
};
