import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('regional_prescription_comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('prescription_id')
      .references('id')
      .inTable('prescriptions')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.string('region').notNullable();
    table
      .foreign(['prescription_id', 'region'])
      .references(['prescription_id', 'region'])
      .inTable('regional_prescriptions');
    table.text('comment').notNullable();
    table.uuid('created_by').references('id').inTable('users').notNullable();
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('regional_prescription_comments');
};
