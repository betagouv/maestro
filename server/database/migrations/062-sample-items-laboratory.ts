import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('sample_items', (table) => {
    table.uuid('laboratory_id').references('id').inTable('laboratories');
    table.string('substance_kind');
    table.integer('copy_number');
    table.dropPrimary();
  });

  await knex('sample_items')
    .updateFrom('samples')
    .where('sample_items.sample_id', knex.raw('samples.id'))
    .andWhere('sample_items.item_number', 1)
    .update({
      laboratory_id: knex.ref('samples.laboratory_id')
    });

  await knex('sample_items').update({
    copy_number: knex.ref('item_number'),
    item_number: 1
  });

  await knex('sample_items').update({
    substance_kind: 'Any'
  });

  await knex.schema.alterTable('sample_items', (table) => {
    table.string('substance_kind').notNullable().alter();
    table.integer('copy_number').notNullable().alter();
    table.primary(['sample_id', 'item_number', 'copy_number']);
  });

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('laboratory_id');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.uuid('laboratory_id').references('id').inTable('laboratories');
  });

  await knex.schema.alterTable('sample_items', (table) => {
    table.dropPrimary();
  });

  await knex('samples')
    .updateFrom('sample_items')
    .where('samples.id', knex.raw('sample_items.sample_id'))
    .andWhere('sample_items.item_number', 1)
    .andWhere('sample_items.copy_number', 1)
    .update({
      laboratory_id: knex.ref('sample_items.laboratory_id')
    });

  await knex('sample_items').whereRaw('copy_number > 1').delete();
  await knex('sample_items').update({
    item_number: knex.ref('copy_number')
  });

  await knex.schema.alterTable('sample_items', (table) => {
    table.dropColumn('laboratory_id');
    table.dropColumn('substance_kind');
    table.dropColumn('copy_number');
    table.primary(['sample_id', 'item_number']);
  });
};
