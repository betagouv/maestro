import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('local_prescription_changes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('prescription_id')
      .notNullable()
      .references('id')
      .inTable('prescriptions')
      .onDelete('CASCADE');
    table.text('region').notNullable();
    table.text('department').notNullable().defaultTo('None');
    table.text('company_siret').notNullable().defaultTo('None');
    table.text('echelon').notNullable();
    table.text('kind').notNullable();
    table.integer('sample_count').nullable();
    table.jsonb('substance_kinds_laboratories').nullable();
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
      ['prescription_id', 'region', 'changes_viewed_at'],
      'local_prescription_changes_pending_idx'
    );
    table.index(
      [
        'prescription_id',
        'region',
        'department',
        'company_siret',
        'echelon',
        'kind',
        'diffused_at'
      ],
      'local_prescription_changes_diffusion_idx'
    );
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('local_prescription_changes');
};
