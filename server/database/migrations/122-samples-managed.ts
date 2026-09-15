import type { Knex } from 'knex';

const subPlansView = (samplesManaged: boolean) => `
  SELECT
    sp.id,
    sp.programming_plan_id,
    sp.sub_plan_number,
    sp.label,
    sp.analysis_permission_role,
    sp.contact_list_id,
    sp.with_sacha,
    CASE WHEN sp.substance_kinds_managed THEN sp.substance_kinds ELSE pp.substance_kinds END AS substance_kinds,
    sp.substance_kinds_managed,
    CASE WHEN sp.stages_managed THEN sp.stages ELSE pp.stages END AS stages,
    sp.stages_managed,
    sp.settings_completed${
      samplesManaged
        ? `,
    CASE WHEN sp.samples_managed THEN sp.samples ELSE pp.samples END AS samples,
    sp.samples_managed`
        : ''
    }
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_plans', (table) => {
    table.jsonb('samples').nullable();
    table.boolean('samples_managed').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.jsonb('samples').nullable();
    table.boolean('samples_managed').notNullable().defaultTo(true);
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);

  await knex.raw(`
    UPDATE programming_sub_plans_raw
    SET samples = (
      SELECT jsonb_agg(
        jsonb_build_object(
          'substanceKind', substance_kind,
          'copies', '[
            { "required": true, "recipientKinds": ["Laboratory"] },
            { "required": false, "recipientKinds": ["Sampler", "Operator"] },
            { "required": false, "recipientKinds": ["Sampler", "Operator"] }
          ]'::jsonb
        )
        ORDER BY
          CASE substance_kind
            WHEN 'Any' THEN 0
            WHEN 'Mono' THEN 1
            WHEN 'Multi' THEN 2
            ELSE 3
          END,
          substance_kind COLLATE "C"
      )
      FROM programming_sub_plans sub_plan,
        unnest(sub_plan.substance_kinds) AS substance_kind
      WHERE sub_plan.id = programming_sub_plans_raw.id
    )
  `);

  await knex.raw(`
    WITH plan_samples AS (
      SELECT programming_plan_id, (array_agg(samples))[1] AS samples
      FROM programming_sub_plans_raw
      GROUP BY programming_plan_id
      HAVING COUNT(samples) = COUNT(*) AND COUNT(DISTINCT samples) = 1
    )
    UPDATE programming_plans
    SET
      substance_kinds = ARRAY(
        SELECT sample->>'substanceKind'
        FROM jsonb_array_elements(plan_samples.samples) WITH ORDINALITY AS sample_item(sample, position)
        ORDER BY position
      ),
      substance_kinds_managed = true,
      samples = plan_samples.samples,
      samples_managed = true
    FROM plan_samples
    WHERE programming_plans.id = plan_samples.programming_plan_id
  `);

  await knex.raw(`
    UPDATE programming_sub_plans_raw
    SET substance_kinds_managed = false, samples_managed = false
    FROM programming_plans
    WHERE programming_plans.id = programming_sub_plans_raw.programming_plan_id
      AND programming_plans.samples_managed
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('samples_managed');
    table.dropColumn('samples');
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('samples_managed');
    table.dropColumn('samples');
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
