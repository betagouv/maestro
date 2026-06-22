import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.text('billing_address').nullable();
    table.text('billing_postal_code').nullable();
    table.text('billing_city').nullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('billing_address');
    table.dropColumn('billing_postal_code');
    table.dropColumn('billing_city');
  });
};
