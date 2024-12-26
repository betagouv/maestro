import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('samples', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('reference').notNullable();
    table.string('department');
    table.string('resytal_id');
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.uuid('sampled_by').references('id').inTable('users');
    table
      .specificType('last_updated_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.specificType('sampled_at', 'timestamptz').notNullable();
    table.specificType('sent_at', 'timestamptz');
    table.specificType('received_at', 'timestamptz');
    table.string('status').notNullable();
    table
      .uuid('programming_plan_id')
      .references('id')
      .inTable('programming_plans');
    table.string('legal_context').notNullable();
    table.point('geolocation').notNullable();
    table.string('parcel');
    table.string('company_siret').references('siret').inTable('companies');
    table.string('matrix');
    table.string('matrix_details');
    table.string('matrix_part');
    table.string('stage');
    table.string('culture_kind');
    table.boolean('release_control');
    table.text('notes_on_creation');
    table.text('notes_on_matrix');
    table.text('notes_on_items');
    table.text('notes_on_admissibility');
    table.uuid('laboratory_id').references('id').inTable('laboratories');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('samples');
};
