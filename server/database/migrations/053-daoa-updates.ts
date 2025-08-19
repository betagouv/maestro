import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.boolean('samples_outside_plan_allowed');
  });

  await knex('programming_plans').update({
    samples_outside_plan_allowed: true
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table
      .specificType('samples_outside_plan_allowed', 'boolean')
      .notNullable()
      .alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('samples_outside_plan_allowed');
  });
};
