import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('sample_specific_data_attributes', (table) => {
    table.boolean('optional').notNullable().defaultTo(false);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('sample_specific_data_attributes', (table) => {
    table.dropColumn('optional');
  });
};
