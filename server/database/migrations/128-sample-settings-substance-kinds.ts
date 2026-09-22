import type { Knex } from 'knex';

const convertSamples = (table: string, convertSample: string) => `
  UPDATE ${table}
  SET samples = (
    SELECT jsonb_agg(${convertSample} ORDER BY position)
    FROM jsonb_array_elements(samples) WITH ORDINALITY AS sample_item(sample, position)
  )
  WHERE jsonb_typeof(samples) = 'array' AND jsonb_array_length(samples) > 0
`;

const toSubstanceKinds = `
  (sample - 'substanceKind') || jsonb_build_object(
    'substanceKinds',
    CASE
      WHEN jsonb_typeof(sample->'substanceKind') = 'string'
        THEN jsonb_build_array(sample->'substanceKind')
      ELSE '[]'::jsonb
    END
  )
`;

const toSubstanceKind = `
  (sample - 'substanceKinds') || jsonb_build_object(
    'substanceKind',
    COALESCE(sample->'substanceKinds'->0, 'null'::jsonb)
  )
`;

export const up = async (knex: Knex) => {
  await knex.raw(convertSamples('programming_plans', toSubstanceKinds));
  await knex.raw(convertSamples('programming_sub_plans_raw', toSubstanceKinds));

  await knex.raw('ALTER TABLE sample_items ADD COLUMN substance_kinds text[]');
  await knex.raw(
    'UPDATE sample_items SET substance_kinds = ARRAY[substance_kind]'
  );
  await knex.raw(
    'ALTER TABLE sample_items ALTER COLUMN substance_kinds SET NOT NULL'
  );
  await knex.raw(
    'ALTER TABLE sample_items ADD CONSTRAINT sample_items_substance_kinds_check CHECK (cardinality(substance_kinds) > 0)'
  );
  await knex.schema.alterTable('sample_items', (table) => {
    table.dropColumn('substance_kind');
  });
};

export const down = async (knex: Knex) => {
  await knex.raw(convertSamples('programming_plans', toSubstanceKind));
  await knex.raw(convertSamples('programming_sub_plans_raw', toSubstanceKind));

  await knex.schema.alterTable('sample_items', (table) => {
    table.string('substance_kind');
  });
  await knex.raw('UPDATE sample_items SET substance_kind = substance_kinds[1]');
  await knex.schema.alterTable('sample_items', (table) => {
    table.string('substance_kind').notNullable().alter();
    table.dropColumn('substance_kinds');
  });
};
