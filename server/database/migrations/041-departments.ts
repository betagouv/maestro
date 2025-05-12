import { Knex } from 'knex';
export const up = async (knex: Knex) => {


  await knex.raw('CREATE EXTENSION IF NOT EXISTS "postgis";');
  await knex.raw(`

      CREATE TABLE departments (
                                       id character varying(5) NOT NULL primary key,
                                       geometry public.geometry NOT NULL
      );

  `)
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('departments');
};
