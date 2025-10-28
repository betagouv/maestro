import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.renameTable(
    'programming_plan_regional_status',
    'programming_plan_local_status'
  );
  await knex.raw(
    `ALTER TABLE programming_plan_local_status
     RENAME CONSTRAINT programming_plan_regional_status_programming_plan_id_foreign
     TO programming_plan_local_status_programming_plan_id_foreign`
  );

  await knex.schema.alterTable('programming_plan_local_status', (table) => {
    table.dropPrimary('programming_plan_regional_status_pkey');
    table.string('department').notNullable().defaultTo('None');
    table.primary(['programming_plan_id', 'region', 'department']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.renameTable(
    'programming_plan_local_status',
    'programming_plan_regional_status'
  );
  await knex.raw(
    `ALTER TABLE programming_plan_regional_status
     RENAME CONSTRAINT programming_plan_local_status_programming_plan_id_foreign
     TO programming_plan_regional_status_programming_plan_id_foreign`
  );

  await knex('programming_plan_regional_status')
    .whereNot('department', 'None')
    .delete();

  await knex.schema.alterTable('programming_plan_regional_status', (table) => {
    table.dropPrimary('programming_plan_local_status_pkey');
    table.dropColumn('department');
    table.primary(['programming_plan_id', 'region']);
  });
};
