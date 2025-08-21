import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex('notices').insert({
    type: 'dashboard'
  });

  await knex.schema.alterTable('notices', (table) => {
    table.text('description').alter();
  });
};

export const down = async (knex: Knex) => {
  await knex('notices').where({ type: 'dashboard' }).delete();
};
