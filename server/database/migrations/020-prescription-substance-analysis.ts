import { Knex } from 'knex';
import { prescriptionsTable } from '../../repositories/prescriptionRepository';
import { prescriptionSubstanceTable } from '../../repositories/prescriptionSubstanceRepository';
import { programmingPlansTable } from '../../repositories/programmingPlanRepository';

export const up = async (knex: Knex) => {
  await knex.schema.renameTable(
    'substance_analysis',
    'prescription_substances'
  );
  await knex.schema.alterTable('prescription_substances', (table) => {
    table
      .uuid('prescription_id')
      .references('id')
      .inTable('prescriptions')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });

  await knex.raw(`
    UPDATE ${prescriptionSubstanceTable}
        SET prescription_id = ${prescriptionsTable}.id
    FROM ${prescriptionsTable}
        JOIN ${programmingPlansTable}
            ON ${programmingPlansTable}.id = ${prescriptionsTable}.programming_plan_id
    WHERE ${prescriptionSubstanceTable}.matrix = ${prescriptionsTable}.matrix
      AND ${programmingPlansTable}.year = ${prescriptionSubstanceTable}.year`);

  await knex.schema.alterTable('prescription_substances', (table) => {
    table.dropPrimary('substance_analysis_pkey');
    table.primary(['prescription_id', 'substance_code']);
    table.index('prescription_id');
    table.dropColumn('year');
    table.dropColumn('matrix');
    table.renameColumn('kind', 'analysis_kind');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescription_substances', (table) => {
    table.integer('year');
    table.string('matrix');
  });

  await knex.raw(`
    UPDATE ${prescriptionSubstanceTable}
        SET year = ${programmingPlansTable}.year,
            matrix = ${prescriptionsTable}.matrix
    FROM ${prescriptionsTable}
        JOIN ${programmingPlansTable}
            ON ${programmingPlansTable}.id = ${prescriptionsTable}.programming_plan_id
    WHERE ${prescriptionSubstanceTable}.prescription_id = ${prescriptionsTable}.id`);

  await knex.schema.renameTable(
    'prescription_substances',
    'substance_analysis'
  );

  await knex.schema.alterTable('substance_analysis', (table) => {
    table.dropPrimary('prescription_substances_pkey');
    table.primary(['matrix', 'substance_code', 'year']);
    table.dropColumn('prescription_id');
    table.renameColumn('analysis_kind', 'kind');
  });
};
