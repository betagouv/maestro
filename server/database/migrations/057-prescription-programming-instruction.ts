import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.text('programming_instruction');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('programming_instruction');
  });
};
