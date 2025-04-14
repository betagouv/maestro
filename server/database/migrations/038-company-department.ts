import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('companies', (table) => {
    table.string('department');
  });
  await knex('companies').update({
    department: knex.raw(
      ` case when postal_code like '97%' then substring(postal_code, 1,3)
        else substring(postal_code, 1,2)
        end
      `
    )
  });

  await knex.schema.alterTable('companies', (table) => {
    table.string('department').notNullable().alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('companies', (table) => {
    table.dropColumn('department');
  });
};
