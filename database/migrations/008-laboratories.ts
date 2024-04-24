import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('laboratories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('laboratories');
};
