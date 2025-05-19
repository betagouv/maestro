import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
      alter table analysis alter column notes_on_compliance type text using notes_on_compliance::text;
  `);
};

export const down = async (knex: Knex) => {};
