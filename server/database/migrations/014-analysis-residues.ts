import { Knex } from 'knex';
import { OptionalBooleanList } from 'maestro-shared/referential/OptionnalBoolean';
import { ResidueComplianceList } from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import { ResidueKindList } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';

export const up = async (knex: Knex) => {
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
    table.enum('result_kind', ['Q', 'NQ']);
    table.double('result');
    table.double('lmr');
    table.enum('result_higher_than_arfd', OptionalBooleanList);
    table.string('notes_on_result');
    table.enum('substance_approved', OptionalBooleanList);
    table.enum('substance_authorised', OptionalBooleanList);
    table.enum('pollution_risk', OptionalBooleanList);
    table.string('notes_on_pollution_risk');
    table.enum('compliance', ResidueComplianceList);
    table.primary(['analysis_id', 'residue_number']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('analysis_residues');
};
