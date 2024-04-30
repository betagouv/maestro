import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('programming_plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title').notNullable();
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table.uuid('created_by').references('id').inTable('users');
    table.string('kind').notNullable();
    table.string('status').notNullable();
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('programming_plans');
};
