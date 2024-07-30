import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.point('geolocation').nullable().alter();
    table.string('company_search');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('company_search');
  });
};
