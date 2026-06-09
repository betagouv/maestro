import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('created_at');
  });
};
