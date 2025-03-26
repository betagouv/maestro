import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
      alter table analysis_residues
      drop constraint analysis_residues_result_kind_check;

      alter table analysis_residues
          add constraint analysis_residues_result_kind_check
              check (result_kind = ANY (ARRAY['Q'::text, 'NQ'::text, 'ND'::text]));
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(`
      alter table analysis_residues
      drop constraint analysis_residues_result_kind_check;

      alter table analysis_residues
          add constraint analysis_residues_result_kind_check
              check (result_kind = ANY (ARRAY['Q'::text, 'NQ'::text]));
  `);;
};
