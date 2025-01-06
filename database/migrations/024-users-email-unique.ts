import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.raw('create unique index users_email_index on users (email)')
  await knex.raw('alter table users drop column password')
};

exports.down = async (knex: Knex) => {
  await knex.raw('drop index public.users_email_index')
  await knex.raw('alter table public.users add password varchar')
};
