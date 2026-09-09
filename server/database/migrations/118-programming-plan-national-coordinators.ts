import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable(
    'programming_plan_national_coordinators',
    (table) => {
      table
        .uuid('programming_plan_id')
        .notNullable()
        .references('id')
        .inTable('programming_plans')
        .onDelete('CASCADE');
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.primary(['programming_plan_id', 'user_id']);
    }
  );
};

export const down = async (knex: Knex) =>
  knex.schema.dropTable('programming_plan_national_coordinators');
