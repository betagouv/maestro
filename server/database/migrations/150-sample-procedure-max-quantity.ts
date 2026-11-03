import type { Knex } from 'knex';

const tableNames = ['programming_plans', 'programming_sub_plans_raw'];

export const up = async (knex: Knex) => {
  for (const tableName of tableNames) {
    await knex.raw(
      `UPDATE ${tableName} SET sample_procedure = sample_procedure || '{"maxQuantity": null}'::jsonb WHERE sample_procedure IS NOT NULL`
    );
  }
};

export const down = async (knex: Knex) => {
  for (const tableName of tableNames) {
    await knex.raw(
      `UPDATE ${tableName} SET sample_procedure = sample_procedure - 'maxQuantity' WHERE sample_procedure IS NOT NULL`
    );
  }
};
