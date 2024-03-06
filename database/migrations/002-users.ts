import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').notNullable();
    table.string('password').notNullable();
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('users');
};
