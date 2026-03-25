import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    update samples 
    set status = 'Completed'
    where status = 'CompletedNotConform'
  `);
};

export const down = async (_knex: Knex) => {};
