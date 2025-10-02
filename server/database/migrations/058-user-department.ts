import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.string('department').nullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('department');
  });
};
