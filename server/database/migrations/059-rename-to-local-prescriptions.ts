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
      RENAME CONSTRAINT local_prescription_comments_prescription_id_region_departmen
      TO regional_prescription_comments_prescription_id_region_departmen`
  );
};
