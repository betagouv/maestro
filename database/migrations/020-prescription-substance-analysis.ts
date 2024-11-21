import { Knex } from 'knex';
import { prescriptionsTable } from '../../server/repositories/prescriptionRepository';
import { prescriptionSubstanceAnalysisTable } from '../../server/repositories/prescriptionSubstanceAnalysisRepository';
import { programmingPlansTable } from '../../server/repositories/programmingPlanRepository';

exports.up = async (knex: Knex) => {
  await knex.schema.renameTable(
    'substance_analysis',
    'prescription_substance_analysis'
  );
  await knex.schema.alterTable('prescription_substance_analysis', (table) => {
    table
      .uuid('prescription_id')
      .references('id')
      .inTable('prescriptions')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });

  await knex.raw(`
    UPDATE ${prescriptionSubstanceAnalysisTable}
        SET prescription_id = ${prescriptionsTable}.id
    FROM ${prescriptionsTable}
        JOIN ${programmingPlansTable}
            ON ${programmingPlansTable}.id = ${prescriptionsTable}.programming_plan_id
    WHERE ${prescriptionSubstanceAnalysisTable}.matrix = ${prescriptionsTable}.matrix
      AND ${programmingPlansTable}.year = ${prescriptionSubstanceAnalysisTable}.year`);

  await knex.schema.alterTable('prescription_substance_analysis', (table) => {
    table.dropPrimary('substance_analysis_pkey');
    table.primary(['prescription_id', 'substance_code']);
    table.index('prescription_id');
    table.dropColumn('year');
    table.dropColumn('matrix');
    table.renameColumn('kind', 'analysis_kind');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.alterTable('prescription_substance_analysis', (table) => {
    table.integer('year');
    table.string('matrix');
  });

  await knex.raw(`
    UPDATE ${prescriptionSubstanceAnalysisTable}
        SET year = ${programmingPlansTable}.year,
            matrix = ${prescriptionsTable}.matrix
    FROM ${prescriptionsTable}
        JOIN ${programmingPlansTable}
            ON ${programmingPlansTable}.id = ${prescriptionsTable}.programming_plan_id
    WHERE ${prescriptionSubstanceAnalysisTable}.prescription_id = ${prescriptionsTable}.id`);

  await knex.schema.renameTable(
    'prescription_substance_analysis',
    'substance_analysis'
  );

  await knex.schema.alterTable('substance_analysis', (table) => {
    table.dropPrimary('prescription_substance_analysis_pkey');
    table.primary(['matrix', 'substance_code', 'year']);
    table.dropColumn('prescription_id');
    table.renameColumn('analysis_kind', 'kind');
  });
};
