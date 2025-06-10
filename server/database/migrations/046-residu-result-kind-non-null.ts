import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(
    `update analysis_residues
     set result_kind = 'Q'
     where result_kind is NULL
     AND result != 0 
     AND result is NOT NULL`
  );

  await knex.raw(
    `update analysis_residues
     set result_kind = 'NQ'
     where result_kind is NULL`
  );

  await knex.raw(`alter table public.analysis_residues
      alter column result_kind set not null;`);
};

export const down = async (knex: Knex) => {
  await knex.raw(`
      alter table public.analysis_residues
          alter column result_kind drop not null;
  `);
};
