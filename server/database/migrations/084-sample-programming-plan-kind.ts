import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.text('programming_plan_kind').nullable();
  });

  await knex.raw(
    `UPDATE samples SET programming_plan_kind = specific_data->>'programmingPlanKind'`
  );

  await knex.schema.alterTable('samples', (table) => {
    table.text('programming_plan_kind').notNullable().alter();
  });

  await knex.raw(
    `UPDATE samples SET specific_data = specific_data::jsonb - 'programmingPlanKind'`
  );
};

export const down = async (knex: Knex) => {
  await knex.raw(
    `UPDATE samples SET specific_data = jsonb_set(specific_data::jsonb, '{programmingPlanKind}', to_jsonb(programming_plan_kind))`
  );

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('programming_plan_kind');
  });
};
