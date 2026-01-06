import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable(
    'laboratory_analytical_competences',
    (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('laboratory_id')
        .references('id')
        .inTable('laboratories')
        .notNullable()
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.string('residue_reference').notNullable();
      table.string('analyte_reference');
      table.string('analytical_method');
      table.string('validation_method');
      table.string('analysis_method');
      table.boolean('is_complete_definition_analysis');
      table.decimal('detection_limit', 10, 4);
      table.decimal('quantification_limit', 10, 4);
    }
  );
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('laboratory_analytical_competences');
};
