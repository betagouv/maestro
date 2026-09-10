import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    ALTER TABLE samples
    ALTER COLUMN programming_sub_plan_id DROP NOT NULL
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(`
    ALTER TABLE samples
    ALTER COLUMN programming_sub_plan_id SET NOT NULL
  `);
};
