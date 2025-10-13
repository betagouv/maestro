import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('sample_items', (table) => {
    table.uuid('laboratory_id').references('id').inTable('laboratories');
  });

  await knex('sample_items')
    .updateFrom('samples')
    .where('sample_items.sample_id', knex.raw('samples.id'))
    .andWhere('sample_items.item_number', 1)
    .update({
      laboratory_id: knex.ref('samples.laboratory_id')
    });

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('laboratory_id');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.uuid('laboratory_id').references('id').inTable('laboratories');
  });

  await knex('samples')
    .updateFrom('sample_items')
    .where('samples.id', knex.raw('sample_items.sample_id'))
    .andWhere('sample_items.item_number', 1)
    .update({
      laboratory_id: knex.ref('sample_items.laboratory_id')
    });

  await knex.schema.alterTable('sample_items', (table) => {
    table.dropColumn('laboratory_id');
  });
};
