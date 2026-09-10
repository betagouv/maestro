import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.timestamp('launched_at', { useTz: true }).nullable();
    table
      .uuid('launched_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });

  await knex('programming_plans').update({
    launched_at: knex.ref('created_at'),
    launched_by: knex.ref('created_by')
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('launched_at');
    table.dropColumn('launched_by');
  });
};
