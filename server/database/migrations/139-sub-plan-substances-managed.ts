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
    CASE WHEN sp.substances_managed THEN sp.substances ELSE pp.substances END AS substances,
    sp.substances_managed`
        : ''
    }
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_plans', (table) => {
    table.jsonb('substances');
    table.boolean('substances_managed').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.jsonb('substances');
    table.boolean('substances_managed').notNullable().defaultTo(true);
  });

  await knex.raw(`
    WITH by_method AS (
      SELECT prescription_id, analysis_method,
        jsonb_agg(substance ORDER BY substance) AS substances
      FROM prescription_substances
      GROUP BY prescription_id, analysis_method
    ),
    by_prescription AS (
      SELECT prescription_id,
        jsonb_object_agg(analysis_method, substances) AS substances
      FROM by_method
      GROUP BY prescription_id
    )
    UPDATE programming_sub_plans_raw sp
    SET substances = bp.substances
    FROM by_prescription bp
    JOIN prescriptions p ON p.id = bp.prescription_id
    WHERE p.programming_sub_plan_id = sp.id
  `);

  await knex.raw(`
    WITH common AS (
      SELECT sp.programming_plan_id
      FROM programming_sub_plans_raw sp
      JOIN programming_plans pp ON pp.id = sp.programming_plan_id
      WHERE NOT pp.substances_managed AND pp.substance_kinds_managed
      GROUP BY sp.programming_plan_id
      HAVING count(DISTINCT sp.substances) = 1
        AND count(sp.substances) = count(*)
        AND bool_and(sp.substances_managed)
    ),
    plans AS (
      UPDATE programming_plans pp
      SET substances = (
        SELECT sp.substances
        FROM programming_sub_plans_raw sp
        WHERE sp.programming_plan_id = pp.id
        LIMIT 1
      ),
      substances_managed = true
      FROM common c
      WHERE pp.id = c.programming_plan_id
      RETURNING pp.id
    )
    UPDATE programming_sub_plans_raw sp
    SET substances_managed = false
    FROM plans p
    WHERE sp.programming_plan_id = p.id AND NOT sp.substance_kinds_managed
  `);

  await knex.schema.dropTable('prescription_substances');

  await knex.raw(
    'ALTER TABLE programming_sub_plans_raw ALTER COLUMN substances_managed DROP DEFAULT'
  );

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

  await knex.raw(`
    INSERT INTO prescription_substances (prescription_id, analysis_method, substance)
    SELECT p.id, s.key, substance
    FROM prescriptions p
    JOIN programming_sub_plans sp ON sp.id = p.programming_sub_plan_id
    CROSS JOIN LATERAL jsonb_each(sp.substances) s
    CROSS JOIN LATERAL jsonb_array_elements_text(s.value) substance
    WHERE s.key IN ('Mono', 'Multi')
    ON CONFLICT DO NOTHING
  `);

  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('substances');
    table.dropColumn('substances_managed');
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('substances');
    table.dropColumn('substances_managed');
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
