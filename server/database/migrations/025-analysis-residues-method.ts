import { Knex } from 'knex';
import { AnalysisMethodList } from '../../../shared/schema/Analysis/AnalysisMethod';

export const up = async (knex: Knex) => {
  await knex.schema.table('analysis_residues', (table) => {
    table.string('analysis_method');
  });

  await knex('analysis_residues')
    .updateFrom('analysis')
    .where('analysis_id', knex.raw('analysis.id'))
    .update({
      analysis_method: knex.ref('analysis.kind')
    });

  await knex.schema.table('analysis_residues', (table) => {
    table.string('analysis_method').notNullable().alter();
  });

  await knex.schema.table('analysis', (table) => {
    table.dropColumn('kind');
  });

  await knex.schema.alterTable('prescription_substances', (table) => {
    table.renameColumn('analysis_kind', 'analysis_method');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescription_substances', (table) => {
    table.renameColumn('analysis_method', 'analysis_kind');
  });

  await knex.schema.table('analysis', (table) => {
    table.enum('kind', AnalysisMethodList);
  });

  await knex('analysis')
    .updateFrom('analysis_residues')
    .where('analysis.id', knex.raw('analysis_id'))
    .update({
      kind: knex.ref('analysis_method')
    });

  await knex.schema.table('analysis_residues', (table) => {
    table.dropColumn('analysis_method');
  });
};
