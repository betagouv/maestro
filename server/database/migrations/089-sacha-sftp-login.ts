import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.text('sacha_sftp_login').nullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('sacha_sftp_login');
  });
};
