import { Knex } from 'knex';
import { AnalysisKindList } from '../../shared/schema/Analysis/AnalysisKind';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('sample_analysis', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('sample_id')
      .references('id')
      .inTable('samples')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.uuid('document_id').references('id').inTable('documents');
    table.enum('kind', AnalysisKindList);
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('sample_analysis');
};
