import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    UPDATE analysis_residues SET lmr = NULL WHERE lmr = 0
  `);
};

export const down = async () => {};
