import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('companies', (table) => {
    table.string('kind');
    table.point('geolocation');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('companies', (table) => {
    table.dropColumn('kind');
    table.dropColumn('geolocation');
  });
};
