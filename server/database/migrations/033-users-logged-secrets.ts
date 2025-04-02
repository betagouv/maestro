import { Knex } from 'knex';
export const up = async (knex: Knex) => {

  await knex.raw(`alter table public.users add logged_secrets uuid[] default '{}' not null;

`)

};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('logged_secrets');
  });
};
