import { Knex } from 'knex';
import { ResultKindList } from '../../shared/schema/Analysis/ResultKind';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('residue_analyte', (table) => {
    table.uuid('analysis_id').references('id').inTable('analysis');
    table.integer('residue_number').notNullable();
    table.integer('analyte_number').notNullable();
    table.string('analyte');
    table.enum('kind', ResultKindList);
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

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('residue_analyte');
};
