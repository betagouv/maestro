import { Knex } from 'knex';
import { AnalysisKindList } from '../../shared/schema/Analysis/AnalysisKind';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('analysis', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('sample_id')
      .references('id')
      .inTable('samples')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.uuid('created_by').references('id').inTable('users');
    table.string('status').notNullable();
    table.uuid('report_document_id').references('id').inTable('documents');
    table.enum('kind', AnalysisKindList);
    table.boolean('compliance');
    table.string('notes_on_compliance');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('analysis');
};
