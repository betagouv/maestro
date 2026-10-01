import type { Knex } from 'knex';

const subPlansView = (labelColumns: string) => `
  SELECT
    sp.id,
    sp.programming_plan_id,
    sp.sub_plan_number,
    ${labelColumns}
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
    sp.matrices
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.string('context');
  });

  await knex.raw(`
    UPDATE programming_sub_plans_raw sp
    SET context = p.context
    FROM prescriptions p
    WHERE p.programming_sub_plan_id = sp.id
  `);

  await knex.raw(
    `CREATE VIEW programming_sub_plans AS ${subPlansView('sp.context,')}`
  );

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('label');
  });

  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('context');
  });
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.string('label').notNullable().defaultTo('');
  });

  await knex.raw(
    `UPDATE programming_sub_plans_raw SET label = sub_plan_number`
  );

  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('context');
  });

  await knex.raw(`
    UPDATE prescriptions p
    SET context = coalesce(sp.context, 'Surveillance')
    FROM programming_sub_plans_raw sp
    WHERE sp.id = p.programming_sub_plan_id
  `);

  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('context').notNullable().alter();
  });

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('context');
  });

  await knex.raw(
    `CREATE VIEW programming_sub_plans AS ${subPlansView('sp.label,')}`
  );
};
