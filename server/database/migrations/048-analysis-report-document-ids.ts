import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('analysis_report_documents', (table) => {
    table
      .uuid('analysis_id')
      .references('id')
      .inTable('analysis')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table
      .uuid('document_id')
      .references('id')
      .inTable('documents')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.primary(['analysis_id', 'document_id']);
  });

  await knex.raw(`
      insert into analysis_report_documents (analysis_id, document_id) select id, report_document_id  from analysis;
  `);
  await knex.schema.alterTable('analysis', (table) => {
    table.dropColumn('report_document_id');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('analysis', (table) => {
    table.uuid('report_document_id').references('id').inTable('documents');
  });

  await knex.raw(`
      update analysis set report_document_id = (select document_id from analysis_report_documents where id = analysis_report_documents.analysis_id LIMIT 1)
  `);
  await knex.schema.alterTable('analysis', (table) => {
    table.uuid('report_document_id').notNullable().alter();
  });
  await knex.schema.dropTable('analysis_report_documents');
};
