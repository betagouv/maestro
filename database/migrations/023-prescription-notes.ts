import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('notes');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('notes');
  });
};
