import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    ALTER TABLE programming_plans
    ALTER COLUMN domain_id SET NOT NULL
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(`
    ALTER TABLE programming_plans
    ALTER COLUMN domain_id DROP NOT NULL
  `);
};
