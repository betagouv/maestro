import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('status_drom');
  });

  await knex('programming_plans').update({
    status_drom: knex.raw('status')
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('status').notNullable().alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('status_drom');
  });
};
