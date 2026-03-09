import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('analysis', (table) => {
    table.dropForeign(['sample_id', 'item_number', 'copy_number']);
  });

  await knex.schema.alterTable('analysis', (table) => {
    table
      .foreign(['sample_id', 'item_number', 'copy_number'])
      .references(['sample_id', 'item_number', 'copy_number'])
      .inTable('sample_items')
      .onDelete('CASCADE');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('analysis', (table) => {
    table.dropForeign(['sample_id', 'item_number', 'copy_number']);
  });

  await knex.schema.alterTable('analysis', (table) => {
    table
      .foreign(['sample_id', 'item_number', 'copy_number'])
      .references(['sample_id', 'item_number', 'copy_number'])
      .inTable('sample_items');
  });
};
