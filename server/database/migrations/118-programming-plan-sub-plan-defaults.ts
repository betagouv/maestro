import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('analysis_permission_role').nullable();
    table.integer('contact_list_id').nullable();
    table.boolean('with_sacha').notNullable().defaultTo(false);
  });

  await knex.raw(`
    update programming_plans pp
    set analysis_permission_role = sp.analysis_permission_role,
        contact_list_id = sp.contact_list_id,
        with_sacha = sp.with_sacha
    from (select distinct on (programming_plan_id)
            programming_plan_id,
            analysis_permission_role,
            contact_list_id,
            with_sacha
          from programming_sub_plans_raw
          order by programming_plan_id, sub_plan_number) sp
    where sp.programming_plan_id = pp.id
  `);
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('analysis_permission_role');
    table.dropColumn('contact_list_id');
    table.dropColumn('with_sacha');
  });
};
