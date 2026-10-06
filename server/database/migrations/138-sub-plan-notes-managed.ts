import type { Knex } from 'knex';

const subPlansView = (notesManaged: boolean) => `
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
    sp.matrices_managed${
      notesManaged
        ? `,
    CASE WHEN sp.notes_managed THEN sp.notes ELSE pp.notes END AS notes,
    sp.notes_managed`
        : ''
    }
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_plans', (table) => {
    table.text('notes');
    table.boolean('notes_managed').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.text('notes');
    table.boolean('notes_managed').notNullable().defaultTo(true);
  });

  await knex.raw(`
    UPDATE programming_sub_plans_raw sp
    SET notes = NULLIF(btrim(p.notes), '')
    FROM prescriptions p
    WHERE p.programming_sub_plan_id = sp.id
  `);

  await knex.raw(`
    WITH common AS (
      SELECT sp.programming_plan_id
      FROM programming_sub_plans_raw sp
      JOIN programming_plans pp ON pp.id = sp.programming_plan_id
      WHERE NOT pp.notes_managed
      GROUP BY sp.programming_plan_id
      HAVING count(DISTINCT sp.notes) = 1
        AND count(sp.notes) = count(*)
        AND bool_and(sp.notes_managed)
    ),
    plans AS (
      UPDATE programming_plans pp
      SET notes = (
        SELECT sp.notes
        FROM programming_sub_plans_raw sp
        WHERE sp.programming_plan_id = pp.id
        LIMIT 1
      ),
      notes_managed = true
      FROM common c
      WHERE pp.id = c.programming_plan_id
      RETURNING pp.id
    )
    UPDATE programming_sub_plans_raw sp
    SET notes_managed = false
    FROM plans p
    WHERE sp.programming_plan_id = p.id
  `);

  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('notes');
  });

  await knex.raw(
    'ALTER TABLE programming_sub_plans_raw ALTER COLUMN notes_managed DROP DEFAULT'
  );

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('notes');
  });

  await knex.raw(`
    UPDATE prescriptions p
    SET notes = sp.notes
    FROM programming_sub_plans sp
    WHERE sp.id = p.programming_sub_plan_id
  `);

  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('notes');
    table.dropColumn('notes_managed');
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('notes');
    table.dropColumn('notes_managed');
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
