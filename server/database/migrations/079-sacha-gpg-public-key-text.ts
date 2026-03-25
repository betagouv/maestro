import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.text('sacha_gpg_public_key').alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.string('sacha_gpg_public_key').alter();
  });
};
