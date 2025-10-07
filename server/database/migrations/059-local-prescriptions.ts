import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.renameTable(
    'regional_prescriptions',
    'local_prescriptions'
  );
  await knex.raw(
    'ALTER INDEX regional_prescriptions_pkey RENAME TO local_prescriptions_pkey'
  );
  await knex.raw(
    `ALTER TABLE local_prescriptions
     RENAME CONSTRAINT prescriptions_laboratory_id_foreign
     TO local_prescriptions_laboratory_id_foreign`
  );
  await knex.raw(
    `ALTER TABLE local_prescriptions
     RENAME CONSTRAINT regional_prescriptions_prescription_id_foreign
     TO local_prescriptions_prescription_id_foreign`
  );

  await knex.schema.renameTable(
    'regional_prescription_comments',
    'local_prescription_comments'
  );
  await knex.raw(
    'ALTER INDEX regional_prescription_comments_pkey RENAME TO local_prescription_comments_pkey'
  );
  await knex.raw(
    `ALTER TABLE local_prescription_comments
     RENAME CONSTRAINT regional_prescription_comments_created_by_foreign
      TO local_prescription_comments_created_by_foreign`
  );
  await knex.raw(
    `ALTER TABLE local_prescription_comments
     RENAME CONSTRAINT regional_prescription_comments_prescription_id_foreign
      TO local_prescription_comments_prescription_id_foreign`
  );
  await knex.raw(
    `ALTER TABLE local_prescription_comments
     RENAME CONSTRAINT regional_prescription_comments_prescription_id_region_departmen
      TO local_prescription_comments_prescription_id_region_departmen`
  );

  await knex.schema.alterTable('local_prescription_comments', (table) => {
    table.dropForeign(
      ['prescription_id', 'region', 'department'],
      'local_prescription_comments_prescription_id_region_departmen'
    );
  });

  await knex.schema.alterTable('local_prescriptions', (table) => {
    table.dropPrimary('local_prescriptions_pkey');
    table.string('company_siret').notNullable().defaultTo('None');
    table.primary(['prescription_id', 'region', 'department', 'company_siret']);
  });

  await knex.schema.alterTable('local_prescription_comments', (table) => {
    table.string('company_siret').notNullable().defaultTo('None');
    table
      .foreign(['prescription_id', 'region', 'department', 'company_siret'])
      .references(['prescription_id', 'region', 'department', 'company_siret'])
      .inTable('local_prescriptions');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.renameTable(
    'local_prescriptions',
    'regional_prescriptions'
  );
  await knex.raw(
    'ALTER INDEX local_prescriptions_pkey RENAME TO regional_prescriptions_pkey'
  );
  await knex.raw(
    `ALTER TABLE regional_prescriptions
     RENAME CONSTRAINT local_prescriptions_laboratory_id_foreign
     TO prescriptions_laboratory_id_foreign`
  );
  await knex.raw(
    `ALTER TABLE regional_prescriptions
     RENAME CONSTRAINT local_prescriptions_prescription_id_foreign
     TO regional_prescriptions_prescription_id_foreign`
  );

  await knex.schema.renameTable(
    'local_prescription_comments',
    'regional_prescription_comments'
  );
  await knex.raw(
    'ALTER INDEX local_prescription_comments_pkey RENAME TO regional_prescription_comments_pkey'
  );
  await knex.raw(
    `ALTER TABLE regional_prescription_comments
      RENAME CONSTRAINT local_prescription_comments_created_by_foreign
      TO regional_prescription_comments_created_by_foreign`
  );
  await knex.raw(
    `ALTER TABLE regional_prescription_comments
      RENAME CONSTRAINT local_prescription_comments_prescription_id_foreign
      TO regional_prescription_comments_prescription_id_foreign`
  );
  await knex.raw(
    `ALTER TABLE regional_prescription_comments
      RENAME CONSTRAINT local_prescription_comments_prescription_id_region_department_c
      TO regional_prescription_comments_prescription_id_region_department_c`
  );

  await knex('regional_prescriptions')
    .whereNot('company_siret', 'None')
    .delete();

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table.dropForeign(
      ['prescription_id', 'region', 'department', 'company_siret'],
      'regional_prescription_comments_prescription_id_region_department_c'
    );
    table.dropColumn('company_siret');
  });

  await knex.schema.alterTable('regional_prescriptions', (table) => {
    table.dropPrimary();
    table.dropColumn('company_siret');
    table.primary(['prescription_id', 'region', 'department']);
  });

  await knex.schema.alterTable('regional_prescription_comments', (table) => {
    table
      .foreign(['prescription_id', 'region', 'department'])
      .references(['prescription_id', 'region', 'department'])
      .inTable('regional_prescriptions');
  });
};
