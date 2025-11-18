import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`alter table public.users
    add disabled boolean default false not null;`);
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('disabled');
  });
};
