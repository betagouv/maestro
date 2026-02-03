import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('sacha_conf', (table) => {
    table.text('version_reference_prescripteur').notNullable().defaultTo('v0');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('sacha_conf', (table) => {
    table.dropColumn('version_reference_prescripteur');
  });
};
