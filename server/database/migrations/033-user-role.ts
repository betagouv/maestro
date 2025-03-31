import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.string('role');
  });

  await knex('users').update({ role: knex.raw(`roles[1]`) });

  const users = await knex('users').select('id', 'roles', 'role');

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('roles');
    table.string('role').notNullable().alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.specificType('roles', `text[]`).nullable();
  });

  await knex('users').update({ roles: knex.raw(`ARRAY[role]`) });

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('role');
    table.specificType('roles', `text[]`).notNullable().alter();
  });
};
