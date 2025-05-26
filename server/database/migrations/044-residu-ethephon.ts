import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    update analysis_residues 
    set reference = 'RF-0160-001-PPP', unknown_label = null
    where unknown_label = 'ethephon'
  `);
};

export const down = async (knex: Knex) => {};
