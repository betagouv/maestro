import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('analysis_dai', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('analysis_id')
      .notNullable()
      .references('id')
      .inTable('analysis')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.enum('state', ['PENDING', 'SENT', 'ERROR']).notNullable();
    table.enum('sent_method', ['EMAIL', 'SFTP']).nullable();
    table.specificType('sent_at', 'timestamptz').nullable();
    table.text('message').nullable();
    table.boolean('edi').nullable();
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.index(['state'], 'analysis_dai_state_idx');
  });

  await knex.schema.createTable('analysis_dai_documents', (table) => {
    table
      .uuid('analysis_dai_id')
      .notNullable()
      .references('id')
      .inTable('analysis_dai')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table
      .uuid('document_id')
      .notNullable()
      .references('id')
      .inTable('documents')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.primary(['analysis_dai_id', 'document_id']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('analysis_dai_documents');
  await knex.schema.dropTable('analysis_dai');
};
