import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropChecks('samples_context_check');
  });
};

export const down = async () => {};
