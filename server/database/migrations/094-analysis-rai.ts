import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('analysis_rai', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('analysis_id')
      .nullable()
      .references('id')
      .inTable('analysis')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');
    table
      .uuid('laboratory_id')
      .nullable()
      .references('id')
      .inTable('laboratories')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');
    table.enum('state', ['PROCESSED', 'ERROR']).notNullable();
    table.enum('source', ['EMAIL', 'SFTP']).notNullable();
    table.boolean('edi').notNullable();
    table.jsonb('payload').nullable();
    table.text('message').nullable();
    table.specificType('received_at', 'timestamptz').notNullable();
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.index(['state'], 'analysis_rai_state_idx');
    table.index(['analysis_id'], 'analysis_rai_analysis_id_idx');
  });

  await knex.schema.createTable('analysis_rai_documents', (table) => {
    table
      .uuid('analysis_rai_id')
      .notNullable()
      .references('id')
      .inTable('analysis_rai')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table
      .uuid('document_id')
      .notNullable()
      .references('id')
      .inTable('documents')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.primary(['analysis_rai_id', 'document_id']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('analysis_rai_documents');
  await knex.schema.dropTable('analysis_rai');
};
