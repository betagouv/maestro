import { Knex } from 'knex';
import { AnalysisKindList } from '../../shared/schema/Analysis/AnalysisKind';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('substance_analysis', (table) => {
    table.string('matrix').notNullable();
    table
      .string('substance_code')
      .notNullable()
      .references('code')
      .inTable('substances');
    table.enum('kind', AnalysisKindList).notNullable();
    table.integer('year').notNullable();
    table.primary(['matrix', 'substance_code']);
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('substance_analysis');
};
