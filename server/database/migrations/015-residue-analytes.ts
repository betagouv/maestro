import { Knex } from 'knex';
import { ResultKindList } from '../../../shared/schema/Analysis/Residue/ResultKind';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('residue_analytes', (table) => {
    table
      .uuid('analysis_id')
      .references('id')
      .inTable('analysis')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.integer('residue_number').notNullable();
    table.integer('analyte_number').notNullable();
    table.string('reference');
    table.enum('result_kind', ResultKindList);
    table.double('result');
    table.primary(['analysis_id', 'residue_number', 'analyte_number']);
    table
      .foreign(['analysis_id', 'residue_number'])
      .references(['analysis_id', 'residue_number'])
      .inTable('analysis_residues')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('residue_analytes');
};
