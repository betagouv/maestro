import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  // Raw SQL with IF EXISTS rather than table.dropChecks(...): this migration
  // must stay re-runnable after a down()+up() cycle, and down() has no way to
  // recreate the original constraint (its definition lived in an older
  // migration), so a second up() would otherwise fail trying to drop it again.
  await knex.raw(
    `ALTER TABLE programming_plan_local_status DROP CONSTRAINT IF EXISTS programming_plan_regional_status_region_check`
  );
  await knex.raw(
    `ALTER TABLE programming_plan_local_status ALTER COLUMN region SET DEFAULT 'None'`
  );

  const programmingPlans = await knex('programming_plans');

  // A plan whose regions have already moved past 'InProgress' was necessarily
  // already sent by the national echelon at some point in the past, even though
  // the national status was never actually tracked before this migration — infer
  // it from the regions instead of defaulting every plan to 'InProgress'.
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
