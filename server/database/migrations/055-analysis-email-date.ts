import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('analysis', (table) => {
    table.specificType('email_received_at', 'timestamptz').nullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('analysis', (table) => {
    table.dropColumn('email_received_at');
  });
};
