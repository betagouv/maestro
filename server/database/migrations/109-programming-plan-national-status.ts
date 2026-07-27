import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(
    `ALTER TABLE programming_plan_local_status DROP CONSTRAINT IF EXISTS programming_plan_regional_status_region_check`
  );
  await knex.raw(
    `ALTER TABLE programming_plan_local_status ALTER COLUMN region SET DEFAULT 'None'`
  );

  const programmingPlans = await knex('programming_plans');

  const advancedProgrammingPlanIds = new Set(
    (
      await knex('programming_plan_local_status')
        .distinct('programmingPlanId')
        .where('region', '!=', 'None')
        .andWhere('status', '!=', 'InProgress')
    ).map((row) => row.programmingPlanId)
  );

  await Promise.all(
    programmingPlans.map((programmingPlan) =>
      knex('programming_plan_local_status').insert({
        programmingPlanId: programmingPlan.id,
        region: 'None',
        department: 'None',
        status: advancedProgrammingPlanIds.has(programmingPlan.id)
          ? 'SubmittedToRegion'
          : 'InProgress'
      })
    )
  );
};

export const down = async (knex: Knex) => {
  await knex('programming_plan_local_status').where('region', 'None').delete();

  await knex.raw(
    `ALTER TABLE programming_plan_local_status ALTER COLUMN region DROP DEFAULT`
  );
};
