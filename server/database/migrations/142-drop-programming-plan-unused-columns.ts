import type { Knex } from 'knex';

const subPlansView = (withAnalysisPermissionRole: boolean) => `
  SELECT
    sp.id,
    sp.programming_plan_id,
    sp.sub_plan_number,
    CASE WHEN sp.context_managed THEN sp.context ELSE pp.context END AS context,
    sp.context_managed,${
      withAnalysisPermissionRole
        ? `
    sp.analysis_permission_role,`
        : ''
    }
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
    sp.multi_substances_managed,
    CASE WHEN sp.sample_procedure_managed THEN sp.sample_procedure ELSE pp.sample_procedure END AS sample_procedure,
    sp.sample_procedure_managed
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('samples_outside_plan_allowed');
  });

  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('analysis_permission_role');
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.boolean('samples_outside_plan_allowed').notNullable().defaultTo(true);
  });

  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.string('analysis_permission_role').nullable();
  });

  await knex.raw(`
    UPDATE programming_sub_plans_raw sp
    SET analysis_permission_role = CASE
      WHEN sp.sub_plan_number LIKE 'PPV%' THEN 'Sampler'
      WHEN 'ABATTAGE' = ANY(
        CASE WHEN sp.stages_managed THEN sp.stages ELSE pp.stages END
      ) THEN 'DepartmentalCoordinator'
    END
    FROM programming_plans pp
    WHERE pp.id = sp.programming_plan_id
  `);

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);
};
