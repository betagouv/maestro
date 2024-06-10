import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('companies', (table) => {
    table.string('siret').primary();
    table.string('name').notNullable();
    table.string('trade_name');
    table.string('address');
    table.string('postal_code');
    table.string('city');
    table.string('naf_code');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('companies');
};
