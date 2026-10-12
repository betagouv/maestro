import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('contexts');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('contexts', 'text[]');
  });

  await knex.raw(`
    UPDATE programming_plans pp
    SET contexts = coalesce(
      (
        SELECT array_agg(DISTINCT sp.context::text ORDER BY sp.context::text)
        FROM programming_sub_plans sp
        WHERE sp.programming_plan_id = pp.id
          AND sp.context IS NOT NULL
      ),
      ARRAY['Surveillance']
    )
  `);

  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('contexts', 'text[]').notNullable().alter();
  });
};
