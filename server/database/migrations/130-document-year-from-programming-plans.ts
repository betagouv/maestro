import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    UPDATE documents d SET year = NULL
    WHERE EXISTS (
      SELECT 1 FROM document_programming_plans dpp
      WHERE dpp.document_id = d.id
    )
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(`
    UPDATE documents d SET year = (
      SELECT max(pp.year)
      FROM document_programming_plans dpp
      JOIN programming_plans pp ON pp.id = dpp.programming_plan_id
      WHERE dpp.document_id = d.id
    )
    WHERE d.year IS NULL
    AND EXISTS (
      SELECT 1 FROM document_programming_plans dpp
      WHERE dpp.document_id = d.id
    )
  `);
};
