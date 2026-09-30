import type { Knex } from 'knex';

const subPlansView = (withMatrix: boolean) => `
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
    sp.samples_managed${
      withMatrix
        ? `,
    sp.matrix_kind,
    sp.matrix`
        : ''
    }
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.string('matrix_kind');
    table.string('matrix');
  });

  await knex.raw(`
    UPDATE programming_sub_plans_raw sp
    SET matrix_kind = p.matrix_kind, matrix = p.matrix
    FROM prescriptions p
    WHERE p.programming_sub_plan_id = sp.id
  `);

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(true)}`);

  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('matrix_kind');
    table.dropColumn('matrix');
  });
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');

  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('matrix_kind');
    table.string('matrix');
  });

  await knex.raw(`
    UPDATE prescriptions p
    SET matrix_kind = sp.matrix_kind, matrix = sp.matrix
    FROM programming_sub_plans_raw sp
    WHERE sp.id = p.programming_sub_plan_id
  `);

  await knex.schema.alterTable('programming_sub_plans_raw', (table) => {
    table.dropColumn('matrix_kind');
    table.dropColumn('matrix');
  });

  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);
};
