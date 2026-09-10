import type { Knex } from 'knex';

export const up = async (knex: Knex) =>
  knex.raw(`
    UPDATE users
    SET stages = '{}'
    WHERE 'NationalCoordinator' = ANY (roles)
  `);

export const down = async (knex: Knex) =>
  knex.raw(`
    UPDATE users
    SET stages = COALESCE((SELECT array_agg(DISTINCT s)
                           FROM programming_plan_national_coordinators ppnc
                                  JOIN programming_sub_plans sp
                                       ON sp.programming_plan_id = ppnc.programming_plan_id,
                                unnest(sp.stages) s
                           WHERE ppnc.user_id = users.id), '{}')
    WHERE 'NationalCoordinator' = ANY (roles)
  `);
