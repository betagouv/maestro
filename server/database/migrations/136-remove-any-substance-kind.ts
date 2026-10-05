import type { Knex } from 'knex';

const substanceKindsArray = (table: string) => `
  UPDATE ${table}
  SET substance_kinds = (
    SELECT array_agg(kind ORDER BY kind)
    FROM (
      SELECT DISTINCT unnest(
        array_remove(substance_kinds, 'Any') || ARRAY['Mono', 'Multi']
      ) AS kind
    ) kinds
  )
  WHERE 'Any' = ANY(substance_kinds)
`;

const foldSubstanceKindsArray = (table: string) => `
  UPDATE ${table}
  SET substance_kinds = (
    SELECT array_agg(kind ORDER BY kind)
    FROM (
      SELECT DISTINCT unnest(
        array_remove(array_remove(substance_kinds, 'Mono'), 'Multi')
          || ARRAY['Any']
      ) AS kind
    ) kinds
  )
  WHERE 'Mono' = ANY(substance_kinds) AND 'Multi' = ANY(substance_kinds)
`;

const convertSamples = (table: string, convertKinds: string) => `
  UPDATE ${table}
  SET samples = (
    SELECT jsonb_agg(
      (sample - 'substanceKinds') || jsonb_build_object(
        'substanceKinds',
        ${convertKinds}
      )
      ORDER BY position
    )
    FROM jsonb_array_elements(samples) WITH ORDINALITY AS sample_item(sample, position)
  )
  WHERE jsonb_typeof(samples) = 'array' AND jsonb_array_length(samples) > 0
`;

const sampleKindsArray = `
  CASE
    WHEN sample->'substanceKinds' @> '["Any"]'::jsonb THEN (
      SELECT coalesce(jsonb_agg(DISTINCT kind), '[]'::jsonb)
      FROM jsonb_array_elements(
        (sample->'substanceKinds') - 'Any' || '["Mono", "Multi"]'::jsonb
      ) AS kind
    )
    ELSE sample->'substanceKinds'
  END
`;

const foldSampleKindsArray = `
  CASE
    WHEN sample->'substanceKinds' @> '["Mono"]'::jsonb
      AND sample->'substanceKinds' @> '["Multi"]'::jsonb THEN (
      SELECT coalesce(jsonb_agg(DISTINCT kind), '[]'::jsonb)
      FROM jsonb_array_elements(
        ((sample->'substanceKinds') - 'Mono') - 'Multi' || '["Any"]'::jsonb
      ) AS kind
    )
    ELSE sample->'substanceKinds'
  END
`;

const splitRows = (table: string, columns: string[]) => {
  const columnList = columns.join(', ');
  const selectList = columns
    .map((column) => (column === 'substance_kind' ? 'kind' : column))
    .join(', ');

  return `
    INSERT INTO ${table} (${columnList})
    SELECT ${selectList}
    FROM ${table}, unnest(ARRAY['Mono', 'Multi']) AS kind
    WHERE substance_kind = 'Any'
    ON CONFLICT DO NOTHING
  `;
};

const splitTables: { table: string; columns: string[] }[] = [
  {
    table: 'laboratory_agreements',
    columns: [
      'laboratory_id',
      'programming_sub_plan_id',
      'substance_kind',
      'reference_laboratory',
      'detection_analysis',
      'confirmation_analysis'
    ]
  },
  {
    table: 'laboratory_agreement_checks',
    columns: [
      'programming_sub_plan_id',
      'substance_kind',
      'checked_at',
      'checked_by'
    ]
  },
  {
    table: 'local_prescription_substance_kinds_laboratories',
    columns: [
      'prescription_id',
      'region',
      'department',
      'substance_kind',
      'laboratory_id'
    ]
  }
];

export const up = async (knex: Knex) => {
  for (const table of ['programming_plans', 'programming_sub_plans_raw']) {
    await knex.raw(substanceKindsArray(table));
    await knex.raw(convertSamples(table, sampleKindsArray));
  }

  await knex.raw(substanceKindsArray('sample_items'));

  for (const { table, columns } of splitTables) {
    await knex.raw(splitRows(table, columns));
    await knex(table).where('substanceKind', 'Any').delete();
  }
};

export const down = async (knex: Knex) => {
  for (const { columns, table } of splitTables) {
    const keptColumns = columns.filter((column) => column !== 'substance_kind');
    await knex.raw(`
      INSERT INTO ${table} (${keptColumns.join(', ')}, substance_kind)
      SELECT ${keptColumns.join(', ')}, 'Any'
      FROM ${table}
      WHERE substance_kind = 'Mono'
      ON CONFLICT DO NOTHING
    `);
    await knex(table).whereIn('substanceKind', ['Mono', 'Multi']).delete();
  }

  await knex.raw(foldSubstanceKindsArray('sample_items'));

  for (const table of ['programming_plans', 'programming_sub_plans_raw']) {
    await knex.raw(foldSubstanceKindsArray(table));
    await knex.raw(convertSamples(table, foldSampleKindsArray));
  }
};
