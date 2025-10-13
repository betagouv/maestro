import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table
      .string('company_siret')
      .nullable()
      .references('siret')
      .inTable('companies');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('company_siret');
  });
};
