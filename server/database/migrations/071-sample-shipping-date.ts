import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.string('shipping_date');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('shipping_date');
  });
};
