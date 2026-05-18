import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('laboratory_agreement_checks', (table) => {
    table
      .uuid('programming_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_plans')
      .onDelete('CASCADE');
    table.text('programming_plan_kind').notNullable();
    table.text('substance_kind').notNullable();
    table.timestamp('checked_at').notNullable().defaultTo(knex.fn.now());
    table
      .uuid('checked_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.primary([
      'programming_plan_id',
      'programming_plan_kind',
      'substance_kind'
    ]);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('laboratory_agreement_checks');
};
