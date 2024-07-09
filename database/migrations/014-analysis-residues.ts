import { Knex } from 'knex';
import { ResidueKindList } from '../../shared/schema/Analysis/ResidueKind';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('analysis_residues', (table) => {
    table
      .uuid('analysis_id')
      .references('id')
      .inTable('analysis')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.integer('residue_number').notNullable();
    table.enum('kind', ResidueKindList);
    table.string('reference');
    table.string('result_kind');
    table.double('quantity');
    table.double('lmr');
    table.string('result_higher_than_arfd');
    table.string('notes_on_result');
    table.string('substance_approved');
    table.string('substance_authorised');
    table.string('pollution_risk');
    table.string('notes_on_pollution_risk');
    table.boolean('compliance');
    table.primary(['analysis_id', 'residue_number']);
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('analysis_residues');
};
