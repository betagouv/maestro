import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.specificType('sampled_at', 'timestamptz').nullable().alter();
    table.string('legal_context').nullable().alter();
    table.string('context').nullable().alter();
  });
};

export const down = async (knex: Knex) => {};
