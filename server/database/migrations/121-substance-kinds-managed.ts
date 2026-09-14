import type { Knex } from 'knex';

const subPlansView = (substanceKindsManaged: boolean) => `
  SELECT
    sp.id,
    sp.programming_plan_id,
    sp.sub_plan_number,
    sp.label,
    sp.analysis_permission_role,
    sp.contact_list_id,
    sp.with_sacha,
    ${
      substanceKindsManaged
        ? `CASE WHEN sp.substance_kinds_managed THEN sp.substance_kinds ELSE pp.substance_kinds END AS substance_kinds,
    sp.substance_kinds_managed,`
        : 'sp.substance_kinds,'
    }
    CASE WHEN sp.stages_managed THEN sp.stages ELSE pp.stages END AS stages,
    sp.stages_managed,
    sp.settings_completed
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('substance_kinds', 'text[]').nullable();
    table.boolean('substance_kinds_managed').notNullable().defaultTo(false);
  });

  await knex.raw(`
    ALTER TABLE programming_sub_plans_raw
    ALTER COLUMN substance_kinds DROP NOT NULL,
    ALTER COLUMN substance_kinds DROP DEFAULT
  `);
  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.boolean('substance_kinds_managed').notNullable().defaultTo(true);
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('substance_kinds_managed');
  });
  await knex.raw(
    `UPDATE programming_sub_plans_raw SET substance_kinds = '{}' WHERE substance_kinds IS NULL`
  );
  await knex.raw(`
    ALTER TABLE programming_sub_plans_raw
    ALTER COLUMN substance_kinds SET DEFAULT '{}',
    ALTER COLUMN substance_kinds SET NOT NULL
  `);

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('substance_kinds_managed');
    table.dropColumn('substance_kinds');
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
