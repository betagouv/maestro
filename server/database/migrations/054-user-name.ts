import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.string('name');
  });

  await knex.raw(`
    update users set name = CONCAT(first_name, ' ', last_name)
  `);

  await knex.schema.alterTable('users', (table) => {
    table.string('name').notNullable().alter();
    table.dropColumn('first_name');
    table.dropColumn('last_name');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('name');
    table.string('first_name').defaultTo('-').notNullable();
    table.string('last_name').defaultTo('-').notNullable();
  });
};
