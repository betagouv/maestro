import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('programming_plan_kinds', (table) => {
    table
      .uuid('programming_plan_id')
      .references('id')
      .inTable('programming_plans')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.string('kind').notNullable();
    table.primary(['programming_plan_id', 'kind']);
  });

  const programmingPlans = await knex('programming_plans');

  if (programmingPlans.length > 0) {
    await knex('programming_plan_kinds').insert(
      programmingPlans.flatMap((plan) =>
        plan.kinds.map((kind: string) => ({
          programming_plan_id: plan.id,
          kind
        }))
      )
    );
  }

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('kinds');
  });

  await knex.schema.alterTable('prescriptions', (table) => {
    table
      .foreign(['programming_plan_id', 'programming_plan_kind'])
      .references(['programming_plan_id', 'kind'])
      .inTable('programming_plan_kinds')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropForeign(['programming_plan_id', 'programming_plan_kind']);
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('kinds', 'text[]');
  });

  const programmingPlanKinds = await knex('programming_plan_kinds')
    .select('programming_plan_id')
    .select(knex.raw('array_agg(kind) as kinds'))
    .groupBy('programming_plan_id');

  await Promise.all(
    programmingPlanKinds.map((row) =>
      knex('programming_plans')
        .where('id', row.programmingPlanId)
        .update({ kinds: row.kinds })
    )
  );

  await knex.schema.dropTableIfExists('programming_plan_kinds');
};
