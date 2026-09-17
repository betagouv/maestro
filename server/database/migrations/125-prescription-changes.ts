import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('prescription_changes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('prescription_id')
      .notNullable()
      .references('id')
      .inTable('prescriptions')
      .onDelete('CASCADE');
    table.integer('sample_count').notNullable();
    table.integer('previous_sample_count').nullable();
    table
      .timestamp('changed_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('diffused_at', { useTz: true }).nullable();
    table.timestamp('changes_viewed_at', { useTz: true }).nullable();
    table
      .uuid('changes_viewed_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.index(
      ['prescription_id', 'diffused_at'],
      'prescription_changes_diffusion_idx'
    );
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('prescription_changes');
};
