import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
};

exports.down = async (knex: Knex) => {};
