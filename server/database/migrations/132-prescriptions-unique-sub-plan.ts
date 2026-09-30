import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.unique(['programming_sub_plan_id']);
    table.dropColumn('programming_plan_id');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table
      .uuid('programming_plan_id')
      .references('id')
      .inTable('programming_plans');
  });

  await knex.raw(
    `update prescriptions p
     set programming_plan_id = s.programming_plan_id
     from programming_sub_plans_raw s
     where s.id = p.programming_sub_plan_id`
  );

  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropUnique(['programming_sub_plan_id']);
  });
};
