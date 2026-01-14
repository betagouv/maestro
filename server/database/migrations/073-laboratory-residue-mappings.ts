import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('laboratory_residue_mappings', (table) => {
    table
      .uuid('laboratory_id')
      .notNullable()
      .references('id')
      .inTable('laboratories')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.string('label').notNullable();
    table.string('ssd2_id');

    table.unique(['laboratory_id', 'label']);

    table.index(['laboratory_id']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('laboratory_residue_mappings');
};
