import type { Knex } from 'knex';

const subPlansView = (matrixColumns: string) => `
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
    sp.settings_completed,
    CASE WHEN sp.samples_managed THEN sp.samples ELSE pp.samples END AS samples,
    sp.samples_managed,
    ${matrixColumns}
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.jsonb('matrices');
  });

  await knex.raw(`
    UPDATE programming_sub_plans_raw
    SET matrices = jsonb_build_object(
      'operator', 'Or',
      'items', jsonb_build_array(
        jsonb_build_object(
          'matrixKind', matrix_kind,
          'matrices', CASE
            WHEN matrix IS NULL OR matrix = matrix_kind THEN '[]'::jsonb
            ELSE jsonb_build_array(matrix)
          END
        )
      )
    )
    WHERE matrix_kind IS NOT NULL
  `);

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('matrix_kind');
    table.dropColumn('matrix');
  });

  await knex.raw(
    `CREATE VIEW programming_sub_plans AS ${subPlansView('sp.matrices')}`
  );
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.string('matrix_kind');
    table.string('matrix');
  });

  await knex.raw(`
    UPDATE programming_sub_plans_raw
    SET
      matrix_kind = matrices->'items'->0->>'matrixKind',
      matrix = CASE
        WHEN jsonb_array_length(matrices->'items'->0->'matrices') = 1
          THEN matrices->'items'->0->'matrices'->>0
      END
    WHERE matrices IS NOT NULL
  `);

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('matrices');
  });

  await knex.raw(
    `CREATE VIEW programming_sub_plans AS ${subPlansView('sp.matrix_kind,\n    sp.matrix')}`
  );
};
