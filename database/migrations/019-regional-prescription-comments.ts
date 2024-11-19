import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('regional_prescription_comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('regional_prescription_id')
      .references('id')
      .inTable('regional_prescriptions')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.text('comment').notNullable();
    table.uuid('created_by').references('id').inTable('users').notNullable();
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('regional_prescription_comments');
};
