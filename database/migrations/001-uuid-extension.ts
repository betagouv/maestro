import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
};

export const down = async (knex: Knex) => {};
