import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_sub_plans', (table) => {
    table.specificType('substance_kinds', 'text[]').nullable();
  });

  await knex.raw(`
    UPDATE programming_sub_plans sp
    SET substance_kinds = pp.substance_kinds
    FROM programming_plans pp
    WHERE sp.programming_plan_id = pp.id
  `);

  await knex.schema.alterTable('programming_sub_plans', (table) => {
    table
      .specificType('substance_kinds', 'text[]')
      .notNullable()
      .defaultTo('{}')
      .alter();
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('substance_kinds');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('substance_kinds', 'text[]').nullable();
  });

  await knex.raw(`
    UPDATE programming_plans pp
    SET substance_kinds = sp.substance_kinds
    FROM (
      SELECT DISTINCT ON (programming_plan_id) programming_plan_id, substance_kinds
      FROM programming_sub_plans
      ORDER BY programming_plan_id, sub_plan_number
    ) sp
    WHERE pp.id = sp.programming_plan_id
  `);

  await knex.schema.alterTable('programming_plans', (table) => {
    table
      .specificType('substance_kinds', 'text[]')
      .notNullable()
      .defaultTo('{}')
      .alter();
  });

  await knex.schema.alterTable('programming_sub_plans', (table) => {
    table.dropColumn('substance_kinds');
  });
};
