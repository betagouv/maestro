import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    update analysis_residues 
    set reference = 'RF-00004675-PAR', unknown_label = ''
    where unknown_label = 'phosphonic acid according reg.'
  `)
};

export const down = async (knex: Knex) => {
};