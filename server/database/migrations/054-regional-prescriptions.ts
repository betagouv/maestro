import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table.dropForeign(['prescription_id', 'region']);
  });

  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table.dropPrimary('regional_prescriptions_pkey');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('department').nullable();
    table.unique(['prescription_id', 'region', 'department']);
  });

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table
      .uuid('regional_prescription_id')
      .references('id')
      .inTable('regional_prescriptions')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });

  await knex('regional_prescription_comments')
    .updateFrom('regional_prescriptions')
    .where(
      'regional_prescription_comments.prescription_id',
      knex.raw('regional_prescriptions.prescription_id')
    )
    .andWhere(
      'regional_prescription_comments.region',
      knex.raw('regional_prescriptions.region')
    )
    .update({
      regional_prescription_id: knex.ref('regional_prescriptions.id')
    });

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table.dropColumns('prescription_id', 'region');
  });
};

export const down = async (knex: Knex) => {
  await knex('regional_prescriptions').whereNotNull('department').delete();

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table.uuid('prescription_id');
    table.string('region');
  });

  await knex('regional_prescription_comments')
    .updateFrom('regional_prescriptions')
    .where('regional_prescription_id', knex.raw('regional_prescriptions.id'))
    .update({
      prescription_id: knex.ref('regional_prescriptions.prescription_id'),
      region: knex.ref('regional_prescriptions.region')
    });

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table.dropColumn('regional_prescription_id');
  });

  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table.dropColumn('id');
    table.dropColumn('department');
    table.primary(['prescription_id', 'region'], {
      constraintName: 'regional_prescriptions_pkey'
    });
  });

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table
      .foreign(['prescription_id', 'region'])
      .references(['prescription_id', 'region'])
      .inTable('regional_prescriptions')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
};
