import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('analysis_errors', (table) => {
    table
      .uuid('analysis_id')
      .references('id')
      .inTable('analysis')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.json('residues').notNullable();
    table.primary(['analysis_id']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('analysis_errors');
};
