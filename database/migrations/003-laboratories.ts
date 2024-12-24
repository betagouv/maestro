import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('laboratories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('email').notNullable();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('laboratories');
};
