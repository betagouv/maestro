import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`update public.users
    set programming_plan_kinds = '{}' where role = 'Administrator';`);
};

export const down = async (knex: Knex) => {};
