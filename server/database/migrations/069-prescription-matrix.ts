import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('matrix');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('matrix');
  });
};
