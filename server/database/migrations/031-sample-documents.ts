import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.createTable('sample_documents', (table) => {
    table
      .uuid('sample_id')
      .notNullable()
      .references('id')
      .inTable('samples')
      .onDelete('CASCADE');
    table
      .uuid('document_id')
      .notNullable()
      .references('id')
      .inTable('documents')
      .onDelete('CASCADE');
  });

  await knex.schema.alterTable('documents', (table) => {
    table.string('legend').nullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('documents', (table) => {
    table.dropColumn('legend');
  });

  await knex.schema.dropTable('sample_documents');
};
