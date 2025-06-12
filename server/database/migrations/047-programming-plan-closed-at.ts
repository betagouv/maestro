import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('closed_at', 'timestamptz');
    table.uuid('closed_by').references('id').inTable('users');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('closed_at');
    table.dropColumn('closed_by');
  });
};
