import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plan_local_status', (table) => {
    table.timestamp('last_sent_at').nullable();
  });
  await knex.raw(
    'UPDATE programming_plan_local_status SET last_sent_at = sent_at'
  );

  await knex.schema.alterTable('local_prescription_changes', (table) => {
    table.timestamp('applied_changes_viewed_at').nullable();
    table
      .uuid('applied_changes_viewed_by')
      .nullable()
      .references('id')
      .inTable('users');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plan_local_status', (table) => {
    table.dropColumn('last_sent_at');
  });
  await knex.schema.alterTable('local_prescription_changes', (table) => {
    table.dropColumn('applied_changes_viewed_at');
    table.dropColumn('applied_changes_viewed_by');
  });
};
