import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary();
    table
      .specificType('created_at', 'timestamptz')
      .defaultTo(knex.raw('current_timestamp'));
    table
      .uuid('recipient_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.string('category').notNullable();
    table.text('message').notNullable();
    table.string('link');
    table.boolean('read').defaultTo(false);
    table
      .uuid('author_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('notifications');
};
