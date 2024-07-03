import { Knex } from 'knex';
import { ResultKindList } from '../../shared/schema/Analysis/ResultKind';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('residue_analyte', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('residue_id')
      .references('id')
      .inTable('analysis_residues')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.string('analyte');
    table.enum('kind', ResultKindList);
    table.double('result');
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('residue_analyte');
};
