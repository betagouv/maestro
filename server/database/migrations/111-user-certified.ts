import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.boolean('certified');
  });

  await knex('users').update({ certified: true });

  await knex.schema.alterTable('users', (table) => {
    table.boolean('certified').notNullable().alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('certified');
  });
};
