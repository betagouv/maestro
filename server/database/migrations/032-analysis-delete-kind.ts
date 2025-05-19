import { Knex } from 'knex';
import { ResidueKindList } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.dropColumn('kind');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.enum('kind', ResidueKindList);
  });
};
