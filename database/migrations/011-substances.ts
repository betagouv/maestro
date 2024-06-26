import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('substances', (table) => {
    table.string('code').primary();
    table.text('label').notNullable();
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('substances');
};
