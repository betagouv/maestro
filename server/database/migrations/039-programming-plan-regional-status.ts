import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plan_regional_status', (table) => {
    table.dropChecks('programming_plan_regional_status_status_check');
    table.string('status').notNullable().alter();
  });
};

export const down = async () => {};
