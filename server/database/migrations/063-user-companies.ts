import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.createTable('user_companies', (table) => {
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table
      .string('company_siret')
      .nullable()
      .references('siret')
      .inTable('companies');
    table.primary(['user_id', 'company_siret']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTableIfExists('user_companies');
};
