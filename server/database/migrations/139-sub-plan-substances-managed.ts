import type { Knex } from 'knex';

const subPlansView = (substancesManaged: boolean) => `
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
    sp.notes_managed${
      substancesManaged
        ? `,
    CASE WHEN sp.mono_substances_managed THEN sp.mono_substances ELSE pp.mono_substances END AS mono_substances,
    sp.mono_substances_managed,
    CASE WHEN sp.multi_substances_managed THEN sp.multi_substances ELSE pp.multi_substances END AS multi_substances,
    sp.multi_substances_managed`
        : ''
    }
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

const columns = [
  { column: 'mono_substances', analysisMethod: 'Mono' },
  { column: 'multi_substances', analysisMethod: 'Multi' }
];

const moveToSubPlan = async (
  knex: Knex,
  column: string,
  analysisMethod: string
) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType(column, 'text[]');
    table.boolean(`${column}_managed`).notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.specificType(column, 'text[]');
    table.boolean(`${column}_managed`).notNullable().defaultTo(true);
  });

  await knex.raw(
    `
    UPDATE programming_sub_plans_raw sp
    SET ${column} = ps.substances
    FROM (
      SELECT prescription_id, array_agg(substance ORDER BY substance) AS substances
      FROM prescription_substances
      WHERE analysis_method = ?
      GROUP BY prescription_id
    ) ps
    JOIN prescriptions p ON p.id = ps.prescription_id
    WHERE p.programming_sub_plan_id = sp.id
  `,
    [analysisMethod]
  );

  await knex.raw(`
    WITH common AS (
      SELECT sp.programming_plan_id
      FROM programming_sub_plans_raw sp
      JOIN programming_plans pp ON pp.id = sp.programming_plan_id
      WHERE NOT pp.${column}_managed AND pp.substance_kinds_managed
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
    WHERE sp.programming_plan_id = p.id AND NOT sp.substance_kinds_managed
  `);

  await knex.raw(
    `ALTER TABLE programming_sub_plans_raw ALTER COLUMN ${column}_managed DROP DEFAULT`
  );
};

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  for (const { column, analysisMethod } of columns) {
    await moveToSubPlan(knex, column, analysisMethod);
  }

  await knex.schema.dropTable('prescription_substances');

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);
};

export const down = async (knex: Knex) => {
  await knex.schema.createTable('prescription_substances', (table) => {
    table.string('substance').notNullable();
    table.text('analysis_method').notNullable();
    table
      .uuid('prescription_id')
      .notNullable()
      .references('id')
      .inTable('prescriptions')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.primary(['prescription_id', 'substance']);
  });

  await knex.raw(`
    ALTER TABLE prescription_substances
    ADD CONSTRAINT substance_analysis_kind_check
    CHECK (analysis_method = ANY (ARRAY['Mono'::text, 'Multi'::text]))
  `);

  for (const { column, analysisMethod } of columns) {
    await knex.raw(
      `
      INSERT INTO prescription_substances (prescription_id, analysis_method, substance)
      SELECT p.id, ?, unnest(sp.${column})
      FROM prescriptions p
      JOIN programming_sub_plans sp ON sp.id = p.programming_sub_plan_id
      ON CONFLICT DO NOTHING
    `,
      [analysisMethod]
    );
  }

  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    for (const { column } of columns) {
      table.dropColumn(column);
      table.dropColumn(`${column}_managed`);
    }
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    for (const { column } of columns) {
      table.dropColumn(column);
      table.dropColumn(`${column}_managed`);
    }
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
