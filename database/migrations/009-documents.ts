import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('filename').notNullable();
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.uuid('created_by').references('id').inTable('users');
    table.string('kind').notNullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('documents');
};
