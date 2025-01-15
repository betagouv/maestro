import { Knex } from 'knex';
import { SampleItemRecipientKindList } from '../../../shared/schema/Sample/SampleItemRecipientKind';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('sample_items', (table) => {
    table
      .uuid('sample_id')
      .references('id')
      .inTable('samples')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.integer('item_number').notNullable();
    table.double('quantity');
    table.string('quantity_unit');
    table.string('seal_id');
    table.boolean('compliance200263');
    table.uuid('support_document_id').references('id').inTable('documents');
    table.enum('recipient_kind', SampleItemRecipientKindList);
    table.string('owner_first_name');
    table.string('owner_last_name');
    table.string('owner_email');
    table.primary(['sample_id', 'item_number']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('sample_items');
};
