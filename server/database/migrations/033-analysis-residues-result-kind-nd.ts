import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
      alter table analysis_residues
      drop constraint analysis_residues_result_kind_check;

      alter table analysis_residues
          add constraint analysis_residues_result_kind_check
              check (result_kind = ANY (ARRAY['Q'::text, 'NQ'::text, 'ND'::text]));
  `);

  await knex.raw(`
      alter table public.residue_analytes
      drop constraint residue_analytes_result_kind_check;

      alter table public.residue_analytes
          add constraint residue_analytes_result_kind_check
              check (result_kind = ANY (ARRAY ['Q'::text, 'NQ'::text, 'ND'::text]));

  `)
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.string('unknown_label')
  });

};

export const down = async (knex: Knex) => {
  await knex.raw(`
      alter table analysis_residues
      drop constraint analysis_residues_result_kind_check;

      alter table analysis_residues
          add constraint analysis_residues_result_kind_check
              check (result_kind = ANY (ARRAY['Q'::text, 'NQ'::text]));
  `);

  await knex.raw(`
      alter table public.residue_analytes
      drop constraint residue_analytes_result_kind_check;

      alter table public.residue_analytes
          add constraint residue_analytes_result_kind_check
              check (result_kind = ANY (ARRAY ['Q'::text, 'NQ'::text]));

  `)
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.dropColumn('unknown_label')
  });
};
