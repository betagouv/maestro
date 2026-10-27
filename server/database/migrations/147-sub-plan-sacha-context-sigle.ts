import type { Knex } from 'knex';

const subPlansView = (withSachaContextSigle: boolean) => `
  SELECT
    sp.id,
    sp.programming_plan_id,
    sp.sub_plan_number,
    CASE WHEN sp.context_managed THEN sp.context ELSE pp.context END AS context,
    sp.context_managed,
    sp.contact_list_id,
    sp.with_sacha,${
      withSachaContextSigle
        ? `
    sp.sacha_context_sigle,`
        : ''
    }
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
    sp.multi_substances_managed,
    CASE WHEN sp.sample_procedure_managed THEN sp.sample_procedure ELSE pp.sample_procedure END AS sample_procedure,
    sp.sample_procedure_managed
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.string('sacha_context_sigle');
  });

  await knex.raw(`
    UPDATE programming_sub_plans_raw sp
    SET sacha_context_sigle = CASE sp.sub_plan_number
      WHEN 'M01' THEN 'PR17_2026_RPDA_PVOL'
      WHEN 'M02' THEN 'PR17_2026_RPDA_PBOV'
    END
    FROM programming_plans pp
    WHERE pp.id = sp.programming_plan_id
      AND pp.year = 2026
      AND sp.sub_plan_number IN ('M01', 'M02')
  `);

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('sacha_context_sigle');
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
