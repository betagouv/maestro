import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.unique(['reference']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropUnique(['reference']);
  });
};
