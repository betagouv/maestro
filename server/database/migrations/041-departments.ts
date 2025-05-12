import { Knex } from 'knex';
export const up = async (knex: Knex) => {


  await knex.raw('CREATE EXTENSION IF NOT EXISTS "postgis";');
  await knex.raw(`

      CREATE TABLE departments (
                                       id character varying(5) NOT NULL primary key,
                                       geometry public.geometry NOT NULL
      );

  `)


  await knex.schema.alterTable('companies', (table) => {
    table.dropColumn('department');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('departments');


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
