import { Knex } from 'knex';
import { isDromRegion, RegionList } from 'maestro-shared/referential/Region';
import { ProgrammingPlanStatusList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
export const up = async (knex: Knex) => {
  await knex.schema.createTable('programming_plan_regional_status', (table) => {
    table
      .uuid('programming_plan_id')
      .references('programming_plans.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .notNullable();
    table.enum('region', RegionList);
    table.enum('status', ProgrammingPlanStatusList);
    table.primary(['programming_plan_id', 'region']);
  });

  const programmingPlans = await knex('programming_plans');

  await Promise.all(
    programmingPlans.flatMap(async (programmingPlan) => {
      RegionList.map(async (region) => {
        await knex('programming_plan_regional_status').insert({
          programming_plan_id: programmingPlan.id,
          region,
          status: isDromRegion(region)
            ? programmingPlan.statusDrom
            : programmingPlan.status
        });
      });
    })
  );

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('status');
    table.dropColumn('status_drom');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('status');
    table.string('status_drom');
  });

  const programmingPlansRegionalStatus = await knex(
    'programming_plan_regional_status'
  );

  const programmingPlans = await knex('programming_plans');

  await Promise.all(
    programmingPlans.map(async (programmingPlan) => {
      await knex('programming_plans')
        .update({
          status: programmingPlansRegionalStatus.find(
            (regionalStatus) =>
              regionalStatus.programmingPlanId === programmingPlan.id &&
              !isDromRegion(regionalStatus.region)
          )?.status,
          status_drom: programmingPlansRegionalStatus.find(
            (regionalStatus) =>
              regionalStatus.programmingPlanId === programmingPlan.id &&
              isDromRegion(regionalStatus.region)
          )?.status
        })
        .where({ id: programmingPlan.id });
    })
  );

  await knex.schema.dropTable('programming_plan_regional_status');
};
