import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable(
    'programming_sub_plan_local_status',
    (table) => {
      table
        .uuid('programming_sub_plan_id')
        .references('programming_sub_plans.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .notNullable();
      table.string('region').notNullable().defaultTo('None');
      table.string('department').notNullable().defaultTo('None');
      table.string('status').notNullable();
      table.primary(['programming_sub_plan_id', 'region', 'department']);
    }
  );

  const programmingSubPlans = await knex('programming_sub_plans').select(
    'id',
    'programming_plan_id as programmingPlanId'
  );

  if (programmingSubPlans.length === 0) {
    return;
  }

  const programmingPlanStatuses = await knex(
    'programming_plan_local_status'
  ).select(
    'programming_plan_id as programmingPlanId',
    'region',
    'department',
    'status'
  );

  const subPlanIdsByPlanId = Map.groupBy(
    programmingSubPlans,
    (sp) => sp.programmingPlanId
  );

  const migratedStatuses = programmingPlanStatuses.flatMap((statusRow) =>
    (subPlanIdsByPlanId.get(statusRow.programmingPlanId) ?? []).map((sp) => ({
      programming_sub_plan_id: sp.id,
      region: statusRow.region,
      department: statusRow.department,
      status: statusRow.status
    }))
  );

  if (migratedStatuses.length > 0) {
    await knex('programming_sub_plan_local_status')
      .insert(migratedStatuses)
      .onConflict(['programming_sub_plan_id', 'region', 'department'])
      .ignore();
  }
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTableIfExists('programming_sub_plan_local_status');
};
