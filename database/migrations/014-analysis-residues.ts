import { Knex } from 'knex';
import { ResidueKindList } from '../../shared/schema/Analysis/ResidueKind';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('analysis_residues', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('analysis_id')
      .references('id')
      .inTable('sample_analysis')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.enum('kind', ResidueKindList);
    table.double('result');
    table.double('lmr');
    table.string('result_higher_than_arfd');
    table.string('notes_on_result');
    table.string('substance_approved');
    table.string('substance_authorised');
    table.string('pollution_risk');
    table.string('notes_on_pollution_risk');
    table.boolean('compliance');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('analysis_residues');
};
