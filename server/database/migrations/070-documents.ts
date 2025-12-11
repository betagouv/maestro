import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('documents', (table) => {
    table.string('name');
    table.text('notes');
  });

  await knex('documents')
    .update({
      kind: 'TechnicalInstruction'
    })
    .whereRaw('filename like ?', ['IT %']);

  await knex('documents')
    .update({
      kind: 'OtherResourceDocument'
    })
    .whereRaw('filename like ?', ['Annexe%']);
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('documents', (table) => {
    table.dropColumn('name');
    table.dropColumn('notes');
  });

  await knex('documents')
    .update({
      kind: 'Resource'
    })
    .whereIn('kind', ['TechnicalInstruction', 'OtherResourceDocument']);
};
