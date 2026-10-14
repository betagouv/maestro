import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('distribution_kind');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('distribution_kind');
  });

  await knex.raw(`
    UPDATE programming_plans pp
    SET distribution_kind = CASE
      WHEN EXISTS (
        SELECT 1 FROM programming_sub_plans sp
        WHERE sp.programming_plan_id = pp.id
          AND sp.sub_plan_number LIKE 'PPV%'
      ) THEN 'REGIONAL'
      WHEN EXISTS (
        SELECT 1 FROM programming_sub_plans sp
        WHERE sp.programming_plan_id = pp.id
          AND 'ABATTAGE' = ANY(sp.stages)
      ) THEN 'SLAUGHTERHOUSE'
      ELSE 'TO_BE_DEFINED'
    END
  `);

  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('distribution_kind').notNullable().alter();
  });
};
