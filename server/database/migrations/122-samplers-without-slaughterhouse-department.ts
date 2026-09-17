import type { Knex } from 'knex';

export const up = async (knex: Knex) =>
  knex.raw(`
    UPDATE users
    SET department = NULL
    WHERE department IS NOT NULL
      AND 'Sampler' = ANY (roles)
      AND NOT ('ABATTAGE' = ANY (stages))
      AND NOT (roles && ARRAY ['DepartmentalCoordinator', 'DepartmentalObserver'])
  `);

export const down = async () => {};
