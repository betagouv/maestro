import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('samples', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('reference').notNullable();
    table.string('region').notNullable();
    table.string('department').notNullable();
    table.string('resytal_id').notNullable();
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.uuid('created_by').references('id').inTable('users');
    table.string('context').notNullable();
    table.point('location').notNullable();
    table.string('location_siret').notNullable();
    table.string('location_name').notNullable();
    table.string('location_address').notNullable();
    table.string('matrix').notNullable();
    table.string('matrix_kind').notNullable();
    table.string('matrix_part').notNullable();
    table.double('quantity').notNullable();
    table.string('quantity_unit').notNullable();
    table.string('culture_kind');
    table.boolean('compliance_2002_63');
    table.string('storage_condition');
    table.boolean('pooling');
    table.boolean('release_control');
    table.integer('sample_count');
    table.boolean('temperature_maintenance');
    table.datetime('expiry_date');
    table.integer('seal_id');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('samples');
};
