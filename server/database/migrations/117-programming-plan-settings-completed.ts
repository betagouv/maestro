import type { Knex } from 'knex';

const subPlansView = (settingsCompleted: boolean) => `
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
    sp.stages_managed${settingsCompleted ? ',\n    sp.settings_completed' : ''}
  FROM programming_sub_plans_raw sp
  JOIN programming_plans pp ON pp.id = sp.programming_plan_id
`;

export const up = async (knex: Knex) => {
  for (const table of ['programming_plans', 'programming_sub_plans_raw']) {
    await knex.schema.alterTable(table, (t) => {
      t.boolean('settings_completed').notNullable().defaultTo(false);
    });
    await knex(table).update({ settings_completed: true });
  }

  await knex.raw(
    `CREATE OR REPLACE VIEW programming_sub_plans AS ${subPlansView(true)}`
  );
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP VIEW programming_sub_plans');
  await knex.raw(`CREATE VIEW programming_sub_plans AS ${subPlansView(false)}`);

  for (const table of ['programming_plans', 'programming_sub_plans_raw']) {
    await knex.schema.alterTable(table, (t) => {
      t.dropColumn('settings_completed');
    });
  }
};
