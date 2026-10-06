import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.jsonb('matrices');
  });

  await knex.raw(`
    UPDATE samples
    SET matrices = jsonb_build_array(
      jsonb_build_object('matrixKind', matrix_kind, 'matrix', matrix)
    )
    WHERE matrix_kind IS NOT NULL
  `);

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('matrix_kind');
    table.dropColumn('matrix');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.string('matrix_kind');
    table.string('matrix');
  });

  await knex.raw(`
    UPDATE samples
    SET matrix_kind = matrices->0->>'matrixKind',
        matrix = matrices->0->>'matrix'
    WHERE matrices IS NOT NULL
  `);

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('matrices');
  });
};
