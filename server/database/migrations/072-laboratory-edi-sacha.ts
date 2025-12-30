import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.string('sacha_email');
    table.string('sacha_gpg_public_key');
    table.string('sacha_sigle');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('sacha_email');
    table.dropColumn('sacha_gpg_public_key');
    table.dropColumn('sacha_sigle');
  });
};
