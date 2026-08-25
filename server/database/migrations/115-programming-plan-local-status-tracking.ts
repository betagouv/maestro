import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plan_local_status', (table) => {
    table.timestamp('sent_at', { useTz: true }).nullable();
    table.timestamp('last_modified_at', { useTz: true }).nullable();
  });

  await knex.raw(`
    UPDATE programming_plan_local_status pls
    SET sent_at = pp.created_at
    FROM programming_plans pp
    WHERE pp.id = pls.programming_plan_id
      AND pls.region = 'None'
      AND pls.status != 'InProgress'
  `);

  await knex.raw(`
    UPDATE programming_plan_local_status pls
    SET sent_at = pp.created_at
    FROM programming_plans pp
    WHERE pp.id = pls.programming_plan_id
      AND pls.region != 'None'
      AND pls.department = 'None'
      AND pls.status IN ('SubmittedToDepartments', 'ApprovedByRegion', 'Validated', 'Closed')
  `);

  await knex.raw(`
    UPDATE programming_plan_local_status pls
    SET sent_at = pp.created_at
    FROM programming_plans pp
    WHERE pp.id = pls.programming_plan_id
      AND pls.department != 'None'
      AND pls.status IN ('Validated', 'Closed')
  `);
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plan_local_status', (table) => {
    table.dropColumn('sent_at');
    table.dropColumn('last_modified_at');
  });
};
