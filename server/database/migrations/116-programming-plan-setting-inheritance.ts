import type { Knex } from 'knex';

const FIELD_INHERITANCES = ['Own', 'Inherited', 'Excluded'];

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('stages', 'text[]').nullable();
    table.boolean('stages_managed').notNullable().defaultTo(false);
  });

  await knex.schema.renameTable(
    'programming_sub_plans',
    'programming_sub_plans_raw'
  );
  await knex.raw(`
    ALTER TABLE programming_sub_plans_raw
    ALTER COLUMN stages DROP NOT NULL,
    ALTER COLUMN stages DROP DEFAULT
  `);
  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.boolean('stages_managed').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('programming_plan_fields', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('programming_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_plans')
      .onDelete('CASCADE');
    table
      .uuid('field_id')
      .notNullable()
      .references('id')
      .inTable('specific_data_fields')
      .onDelete('CASCADE');
    table.boolean('required').notNullable().defaultTo(true);
    table.integer('order').notNullable();
    table.unique(['programming_plan_id', 'field_id']);
  });

  await knex.schema.createTable('programming_plan_field_options', (table) => {
    table
      .uuid('programming_plan_field_id')
      .notNullable()
      .references('id')
      .inTable('programming_plan_fields')
      .onDelete('CASCADE');
    table
      .uuid('specific_data_field_option_id')
      .notNullable()
      .references('id')
      .inTable('specific_data_field_options')
      .onDelete('CASCADE');
    table.primary([
      'programming_plan_field_id',
      'specific_data_field_option_id'
    ]);
  });

  await knex.schema.renameTable(
    'programming_sub_plan_fields',
    'programming_sub_plan_fields_raw'
  );
  await knex.raw(`
    ALTER TABLE programming_sub_plan_fields_raw
    ADD COLUMN inheritance text NOT NULL DEFAULT 'Own'
      CHECK (inheritance IN (${FIELD_INHERITANCES.map((_) => `'${_}'`).join(', ')}))
  `);

  const duplicates = await knex('programming_sub_plan_fields_raw')
    .select('programming_sub_plan_id', 'field_id')
    .count('* as count')
    .groupBy('programming_sub_plan_id', 'field_id')
    .havingRaw('count(*) > 1');

  if (duplicates.length > 0) {
    throw new Error(
      `Cannot add UNIQUE (programming_sub_plan_id, field_id) on programming_sub_plan_fields_raw: ${duplicates.length} duplicate pair(s) found. Deduplicate them first: ${JSON.stringify(duplicates)}`
    );
  }

  await knex.raw(`
    ALTER TABLE programming_sub_plan_fields_raw
    ADD CONSTRAINT programming_sub_plan_fields_sub_plan_field_unique
      UNIQUE (programming_sub_plan_id, field_id)
  `);

  await knex.raw(`
    CREATE VIEW programming_sub_plans AS
    SELECT
      sp.id,
      sp.programming_plan_id,
      sp.sub_plan_number,
      sp.label,
      sp.analysis_permission_role,
      sp.contact_list_id,
      sp.with_sacha,
      sp.substance_kinds,
      CASE WHEN sp.stages_managed THEN sp.stages ELSE pp.stages END AS stages,
      sp.stages_managed
    FROM programming_sub_plans_raw sp
    JOIN programming_plans pp ON pp.id = sp.programming_plan_id
  `);

  await knex.raw(`
    CREATE VIEW programming_sub_plan_field_settings AS
    SELECT
      spf.id,
      spf.programming_sub_plan_id,
      spf.field_id,
      spf.inheritance,
      CASE WHEN spf.inheritance = 'Own'
        THEN spf.required
        ELSE COALESCE(pf.required, spf.required)
      END AS required,
      (ROW_NUMBER() OVER (
        PARTITION BY spf.programming_sub_plan_id
        ORDER BY (pf.id IS NULL), COALESCE(pf."order", spf."order"), spf.id
      ))::int AS "order",
      pf.id AS programming_plan_field_id
    FROM programming_sub_plan_fields_raw spf
    JOIN programming_sub_plans_raw sp ON sp.id = spf.programming_sub_plan_id
    LEFT JOIN programming_plan_fields pf
      ON pf.programming_plan_id = sp.programming_plan_id
     AND pf.field_id = spf.field_id
  `);

  await knex.raw(`
    CREATE VIEW programming_sub_plan_fields AS
    SELECT
      id,
      programming_sub_plan_id,
      field_id,
      inheritance,
      required,
      (ROW_NUMBER() OVER (
        PARTITION BY programming_sub_plan_id ORDER BY "order"
      ))::int AS "order",
      programming_plan_field_id
    FROM programming_sub_plan_field_settings
    WHERE inheritance <> 'Excluded'
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW IF EXISTS programming_sub_plan_fields');
  await knex.raw('DROP VIEW IF EXISTS programming_sub_plan_field_settings');
  await knex.raw('DROP VIEW IF EXISTS programming_sub_plans');

  await knex.raw(`
    ALTER TABLE programming_sub_plan_fields_raw
    DROP CONSTRAINT programming_sub_plan_fields_sub_plan_field_unique,
    DROP COLUMN inheritance
  `);
  await knex.schema.renameTable(
    'programming_sub_plan_fields_raw',
    'programming_sub_plan_fields'
  );

  await knex.schema.dropTable('programming_plan_field_options');
  await knex.schema.dropTable('programming_plan_fields');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('stages_managed');
  });
  await knex.raw(
    `UPDATE programming_sub_plans_raw SET stages = '{}' WHERE stages IS NULL`
  );
  await knex.raw(`
    ALTER TABLE programming_sub_plans_raw
    ALTER COLUMN stages SET DEFAULT '{}',
    ALTER COLUMN stages SET NOT NULL
  `);
  await knex.schema.renameTable(
    'programming_sub_plans_raw',
    'programming_sub_plans'
  );

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('stages_managed');
    table.dropColumn('stages');
  });
};
