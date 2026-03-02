import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('sample_items', (table) => {
    table.string('shipping_date');
    table.string('destruction_date');
    table.string('carrier');
    table.string('invoicing_date');
    table.boolean('payment');
    table.string('payment_date');
    table.string('invoice_number');
    table.string('budget_notes');
  });

  await knex('sample_items')
    .updateFrom('samples')
    .where('sample_items.sample_id', knex.raw('samples.id'))
    .andWhere('sample_items.item_number', 1)
    .update({
      shipping_date: knex.ref('samples.shipping_date')
    });

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('shipping_date');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.string('shipping_date');
  });

  await knex('samples')
    .updateFrom('sample_items')
    .where('samples.id', knex.raw('sample_items.sample_id'))
    .andWhere('sample_items.item_number', 1)
    .andWhere('sample_items.copy_number', 1)
    .update({
      shipping_date: knex.ref('sample_items.shipping_date')
    });

  await knex.schema.alterTable('sample_items', (table) => {
    table.dropColumn('shipping_date');
    table.dropColumn('destruction_date');
    table.dropColumn('carrier');
    table.dropColumn('invoicing_date');
    table.dropColumn('payment');
    table.dropColumn('payment_date');
    table.dropColumn('invoice_number');
    table.dropColumn('budget_notes');
  });
};
