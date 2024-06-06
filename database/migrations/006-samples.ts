import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('samples', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('reference').notNullable();
    table.string('department');
    table.string('resytal_id');
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.uuid('created_by').references('id').inTable('users');
    table
      .specificType('last_updated_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.specificType('sampled_at', 'timestamptz').notNullable();
    table.specificType('sent_at', 'timestamptz');
    table.string('status').notNullable();
    table
      .uuid('programming_plan_id')
      .references('id')
      .inTable('programming_plans');
    table.string('legal_context').notNullable();
    table.point('geolocation').notNullable();
    table.string('parcel');
    table.uuid('company_id').references('id').inTable('companies');
    table.string('matrix');
    table.string('matrix_details');
    table.string('matrix_part');
    table.string('stage');
    table.string('culture_kind');
    table.boolean('release_control');
    table.text('comment_creation');
    table.text('comment_company');
    table.text('comment_infos');
    table.text('comment_items');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('samples');
};
