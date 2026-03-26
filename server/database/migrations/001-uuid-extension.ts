import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
};

export const down = async (_knex: Knex) => {};
