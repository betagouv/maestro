import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plan_local_status', (table) => {
    table.dropChecks('programming_plan_regional_status_region_check');
  });
  await knex.raw(
    `ALTER TABLE programming_plan_local_status ALTER COLUMN region SET DEFAULT 'None'`
  );

  await knex('programming_plans').then((programmingPlans) =>
    Promise.all(
      programmingPlans.map((programmingPlan) =>
        knex('programming_plan_local_status').insert({
          programmingPlanId: programmingPlan.id,
          region: 'None',
          department: 'None',
          status: 'InProgress'
        })
      )
    )
  );
};

export const down = async (knex: Knex) => {
  await knex('programming_plan_local_status').where('region', 'None').delete();

  await knex.raw(
    `ALTER TABLE programming_plan_local_status ALTER COLUMN region DROP DEFAULT`
  );
};
