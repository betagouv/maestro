import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.raw(`alter table public.users
    alter column name drop not null;
`);
  await knex.raw(`update users set name = null where name = '-';`);
};

export const down = async (knex: Knex) => {
  await knex.raw(`update users set name='-' where name is null;`);
  await knex.raw(`alter table public.users
    alter column name set not null;`);
};
