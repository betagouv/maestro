import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('notices', (table) => {
    table.string('type').notNullable();
    table.string('title');
    table.string('description');
    table.primary(['type']);
  });

  await knex.raw(`insert into notices (type) values ('root')`);
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('notices');
};
