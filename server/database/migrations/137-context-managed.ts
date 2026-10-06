import type { Knex } from 'knex';

const subPlansView = (contextManaged: boolean) => `
  SELECT
    sp.id,
    sp.programming_plan_id,
    sp.sub_plan_number,
    ${
      contextManaged
        ? `CASE WHEN sp.context_managed THEN sp.context ELSE pp.context END AS context,
    sp.context_managed,`
        : 'sp.context,'
    }
    sp.analysis_permission_role,
    sp.contact_list_id,
    sp.with_sacha,
    CASE WHEN sp.substance_kinds_managed THEN sp.substance_kinds ELSE pp.substance_kinds END AS substance_kinds,
    sp.substance_kinds_managed,
    CASE WHEN sp.stages_managed THEN sp.stages ELSE pp.stages END AS stages,
    sp.stages_managed,
    sp.settings_completed,
    CASE WHEN sp.samples_managed THEN sp.samples ELSE pp.samples END AS samples,
    sp.samples_managed,
    CASE WHEN sp.matrices_managed THEN sp.matrices ELSE pp.matrices END AS matrices,
    sp.matrices_managed
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

const manageCommonValueAtPlanLevel = async (
  knex: Knex,
  column: string,
  planCondition: string,
  subPlanCondition: string
) => {
  await knex.raw(`
    WITH common AS (
      SELECT sp.programming_plan_id
      FROM programming_sub_plans_raw sp
      JOIN programming_plans pp ON pp.id = sp.programming_plan_id
      WHERE NOT pp.${column}_managed ${planCondition}
      GROUP BY sp.programming_plan_id
      HAVING count(DISTINCT sp.${column}) = 1
        AND count(sp.${column}) = count(*)
        AND bool_and(sp.${column}_managed)
    ),
    plans AS (
      UPDATE programming_plans pp
      SET ${column} = (
        SELECT sp.${column}
        FROM programming_sub_plans_raw sp
        WHERE sp.programming_plan_id = pp.id
        LIMIT 1
      ),
      ${column}_managed = true
      FROM common c
      WHERE pp.id = c.programming_plan_id
      RETURNING pp.id
    )
    UPDATE programming_sub_plans_raw sp
    SET ${column}_managed = false
    FROM plans p
    WHERE sp.programming_plan_id = p.id ${subPlanCondition}
  `);
};

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('context');
    table.boolean('context_managed').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.boolean('context_managed').notNullable().defaultTo(true);
  });

  await manageCommonValueAtPlanLevel(knex, 'context', '', '');
  await manageCommonValueAtPlanLevel(knex, 'stages', '', '');
  await manageCommonValueAtPlanLevel(knex, 'substance_kinds', '', '');
  await manageCommonValueAtPlanLevel(knex, 'matrices', '', '');
  await manageCommonValueAtPlanLevel(
    knex,
    'samples',
    'AND pp.substance_kinds_managed',
    'AND NOT sp.substance_kinds_managed'
  );

  await knex.raw(`
    ALTER TABLE programming_sub_plans_raw
      ALTER COLUMN context_managed DROP DEFAULT,
      ALTER COLUMN stages_managed DROP DEFAULT,
      ALTER COLUMN substance_kinds_managed DROP DEFAULT,
      ALTER COLUMN samples_managed DROP DEFAULT,
      ALTER COLUMN matrices_managed DROP DEFAULT
  `);

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.raw(`
    ALTER TABLE programming_sub_plans_raw
      ALTER COLUMN stages_managed SET DEFAULT true,
      ALTER COLUMN substance_kinds_managed SET DEFAULT true,
      ALTER COLUMN samples_managed SET DEFAULT true,
      ALTER COLUMN matrices_managed SET DEFAULT true
  `);

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('context_managed');
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('context');
    table.dropColumn('context_managed');
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
