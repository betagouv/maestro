import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('samples_outside_plan_allowed');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.boolean('samples_outside_plan_allowed').notNullable().defaultTo(true);
  });
};
