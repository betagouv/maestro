import type { Knex } from 'knex';

const subPlansView = (sampleProcedureManaged: boolean) => `
  SELECT
    sp.id,
    sp.programming_plan_id,
    sp.sub_plan_number,
    CASE WHEN sp.context_managed THEN sp.context ELSE pp.context END AS context,
    sp.context_managed,
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
    sp.matrices_managed,
    CASE WHEN sp.programming_instruction_managed THEN sp.programming_instruction ELSE pp.programming_instruction END AS programming_instruction,
    sp.programming_instruction_managed,
    CASE WHEN sp.notes_managed THEN sp.notes ELSE pp.notes END AS notes,
    sp.notes_managed,
    CASE WHEN sp.mono_substances_managed THEN sp.mono_substances ELSE pp.mono_substances END AS mono_substances,
    sp.mono_substances_managed,
    CASE WHEN sp.multi_substances_managed THEN sp.multi_substances ELSE pp.multi_substances END AS multi_substances,
    sp.multi_substances_managed${
      sampleProcedureManaged
        ? `,
    CASE WHEN sp.sample_procedure_managed THEN sp.sample_procedure ELSE pp.sample_procedure END AS sample_procedure,
    sp.sample_procedure_managed`
        : ''
    }
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_plans', (table) => {
    table.jsonb('sample_procedure');
    table.boolean('sample_procedure_managed').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.jsonb('sample_procedure');
    table.boolean('sample_procedure_managed').notNullable().defaultTo(true);
  });

  await knex.raw(
    `
    UPDATE programming_sub_plans_raw
    SET sample_procedure = ?::jsonb
    WHERE sub_plan_number NOT LIKE 'PPV%'
  `,
    [
      JSON.stringify({
        unitCount: null,
        minQuantity: '200 grammes',
        container: 'Contenant en plastique',
        samplingTemperature: null,
        storageTemperature: '-18°',
        maxAnalysisDelay: '30 jours'
      })
    ]
  );

  await knex.raw(`
    WITH common AS (
      SELECT sp.programming_plan_id
      FROM programming_sub_plans_raw sp
      JOIN programming_plans pp ON pp.id = sp.programming_plan_id
      WHERE NOT pp.sample_procedure_managed
      GROUP BY sp.programming_plan_id
      HAVING count(DISTINCT sp.sample_procedure) = 1
        AND count(sp.sample_procedure) = count(*)
        AND bool_and(sp.sample_procedure_managed)
    ),
    plans AS (
      UPDATE programming_plans pp
      SET sample_procedure = (
        SELECT sp.sample_procedure
        FROM programming_sub_plans_raw sp
        WHERE sp.programming_plan_id = pp.id
        LIMIT 1
      ),
      sample_procedure_managed = true
      FROM common c
      WHERE pp.id = c.programming_plan_id
      RETURNING pp.id
    )
    UPDATE programming_sub_plans_raw sp
    SET sample_procedure_managed = false
    FROM plans p
    WHERE sp.programming_plan_id = p.id
  `);

  await knex.raw(
    'ALTER TABLE programming_sub_plans_raw ALTER COLUMN sample_procedure_managed DROP DEFAULT'
  );

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  for (const tableName of ['programming_sub_plans_raw', 'programming_plans']) {
    await knex.schema.alterTable(tableName, (table) => {
      table.dropColumn('sample_procedure');
      table.dropColumn('sample_procedure_managed');
    });
  }

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
