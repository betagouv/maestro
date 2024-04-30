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
      .inTable('programming_plans')
      .notNullable();
    table.string('legal_context').notNullable();
    table.point('user_location').notNullable();
    table.string('location_siret');
    table.string('location_name');
    table.string('location_address');
    table.string('matrix');
    table.string('matrix_kind');
    table.string('matrix_part');
    table.string('stage');
    table.string('culture_kind');
    table.string('storage_condition');
    table.boolean('release_control');
    table.boolean('temperature_maintenance');
    table.datetime('expiry_date');
    table.text('comment');
  });
  await knex.raw(`CREATE SEQUENCE samples_serial;`);
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('samples');
  await knex.raw(`DROP SEQUENCE samples_serial;`);
};
