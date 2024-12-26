import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('prescriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('programming_plan_id')
      .references('id')
      .inTable('programming_plans');
    table.string('region');
    table.string('matrix');
    table.specificType('stages', 'text[]');
    table.integer('sample_count');
    table.uuid('laboratory_id').references('id').inTable('laboratories');
  });
  await knex.schema.alterTable('prescriptions', (table) => {
    table.unique(['programming_plan_id', 'region', 'matrix', 'stages']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('prescriptions');
};
