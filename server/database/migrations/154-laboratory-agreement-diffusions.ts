import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('laboratory_agreement_diffusions', (table) => {
    table.integer('year').primary();
    table.timestamp('diffused_at').notNullable();
    table.uuid('diffused_by').references('id').inTable('users');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('laboratory_agreement_diffusions');
};
