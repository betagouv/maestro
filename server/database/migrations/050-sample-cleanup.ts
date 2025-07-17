import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumns(
      'matrix_details',
      'matrix_part',
      'culture_kind',
      'release_control'
    );
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.string('matrix_details');
    table.string('matrix_part');
    table.string('culture_kind');
    table.boolean('release_control');
  });
};
