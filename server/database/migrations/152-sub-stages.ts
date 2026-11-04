import type { Knex } from 'knex';

const subPlansView = `
  SELECT
    sp.id,
    sp.programming_plan_id,
    sp.sub_plan_number,
    CASE WHEN sp.context_managed THEN sp.context ELSE pp.context END AS context,
    sp.context_managed,
    sp.contact_list_id,
    sp.with_sacha,
    sp.sacha_context_sigle,
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

const tables = ['programming_plans', 'programming_sub_plans_raw'];

const convertStages = async (
  knex: Knex,
  columnType: 'jsonb' | 'text[]',
  conversion: string
) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  for (const table of tables) {
    await knex.raw(
      `ALTER TABLE ${table} ADD COLUMN converted_stages ${columnType}`
    );
    await knex.raw(
      `UPDATE ${table} SET converted_stages = (${conversion}) WHERE stages IS NOT NULL`
    );
    await knex.raw(`ALTER TABLE ${table} DROP COLUMN stages`);
    await knex.raw(
      `ALTER TABLE ${table} RENAME COLUMN converted_stages TO stages`
    );
  }

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView}`);
};

export const up = async (knex: Knex) =>
  convertStages(
    knex,
    'jsonb',
    `SELECT coalesce(
       jsonb_agg(
         jsonb_build_object('stage', stage, 'subStages', '[]'::jsonb)
         ORDER BY ordinality
       ),
       '[]'::jsonb
     )
     FROM unnest(stages) WITH ORDINALITY AS t(stage, ordinality)`
  );

export const down = async (knex: Knex) =>
  convertStages(
    knex,
    'text[]',
    `SELECT coalesce(array_agg(item ->> 'stage' ORDER BY ordinality), '{}')
     FROM jsonb_array_elements(stages) WITH ORDINALITY AS t(item, ordinality)`
  );
