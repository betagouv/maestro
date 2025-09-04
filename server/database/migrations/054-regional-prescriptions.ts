import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table.dropForeign(['prescription_id', 'region']);
  });

  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table.dropPrimary('regional_prescriptions_pkey');
    table.string('department').notNullable().defaultTo('None');
    table.primary(['prescription_id', 'region', 'department']);
  });

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table.string('department').notNullable().defaultTo('None');
    table
      .foreign(['prescription_id', 'region', 'department'])
      .references(['prescription_id', 'region', 'department'])
      .inTable('regional_prescriptions');
  });
};

export const down = async (knex: Knex) => {
  await knex('regional_prescriptions').whereNot('department', 'None').delete();

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table.dropForeign(['prescription_id', 'region', 'department']);
    table.dropColumn('department');
  });

  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table.dropPrimary();
    table.dropColumn('department');
    table.primary(['prescription_id', 'region']);
  });

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table
      .foreign(['prescription_id', 'region'])
      .references(['prescription_id', 'region'])
      .inTable('regional_prescriptions');
  });
};
