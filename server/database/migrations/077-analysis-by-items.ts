import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('analysis', (table) => {
    table.integer('item_number');
    table.integer('copy_number');
    table.dropForeign(['sample_id']);
  });

  await knex('analysis').update({
    copy_number: 1,
    item_number: 1
  });

  await knex.schema.alterTable('analysis', (table) => {
    table
      .foreign(['sample_id', 'item_number', 'copy_number'])
      .references(['sample_id', 'item_number', 'copy_number'])
      .inTable('sample_items');
  });
};

export const down = async (knex: Knex) => {
  await knex('analysis')
    .where('item_number', '>', 1)
    .orWhere('copy_number', '>', 1)
    .delete();

  await knex.schema.alterTable('analysis', (table) => {
    table.dropForeign(['sample_id', 'item_number', 'copy_number']);
    table.dropColumn('item_number');
    table.dropColumn('copy_number');
    table.foreign('sample_id').references('id').inTable('samples');
  });
};
