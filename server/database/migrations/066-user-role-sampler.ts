import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`update public.users
    set role = 'Sampler' where role = 'DepartmentalSampler';`);
};

export const down = async (knex: Knex) => {};
