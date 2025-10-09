import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable(
    'local_prescription_substances_laboratories',
    (table) => {
      table
        .uuid('prescription_id')
        .references('id')
        .inTable('prescriptions')
        .notNullable()
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.string('region').notNullable();
      table.string('department').notNullable().defaultTo('None');
      table.string('substance').notNullable();
      table.uuid('laboratory_id').references('id').inTable('laboratories');
      table.primary(['prescription_id', 'region', 'department', 'substance']);
    }
  );

  const prescriptionLaboratories = await knex
    .select(
      'prescription_id',
      'region',
      'department',
      knex.raw("'Any' as substance"),
      'laboratory_id'
    )
    .from('local_prescriptions')
    .whereNotNull('laboratory_id');

  if (prescriptionLaboratories.length > 0) {
    await knex('local_prescription_substances_laboratories').insert(
      prescriptionLaboratories
    );
  }

  await knex.schema.alterTable('local_prescriptions', (table) => {
    table.dropColumn('laboratory_id');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('local_prescriptions', (table) => {
    table.uuid('laboratory_id').references('id').inTable('laboratories');
  });

  const prescriptionLaboratories = await knex
    .select('prescription_id', 'region', 'department', 'laboratory_id')
    .from('local_prescription_substances_laboratories')
    .where('substance', 'Any');

  await Promise.all(
    prescriptionLaboratories.map(async (prescriptionLaboratory) => {
      await knex('local_prescriptions')
        .where({
          prescription_id: prescriptionLaboratory.prescriptionId,
          region: prescriptionLaboratory.region,
          department: prescriptionLaboratory.department,
          company_siret: 'None'
        })
        .update({
          laboratory_id: prescriptionLaboratory.laboratoryId
        });
    })
  );

  await knex.schema.dropTable('local_prescription_substances_laboratories');
};
