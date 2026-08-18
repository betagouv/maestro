import type { Knex } from 'knex';

const StageBySubStage: Record<string, string> = {
  STADE1: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE2: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE3: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE4: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE5: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE6: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE7: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE8: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE9: 'PRODUCTION_PRIMAIRE_VEGETALE',
  STADE10: 'ABATTAGE',
  STADE11: 'ELEVAGE',
  STADE12: 'MISE_SUR_LE_MARCHE'
};

const mappingValues = Object.entries(StageBySubStage)
  .map(([subStage, stage]) => `('${subStage}', '${stage}')`)
  .join(', ');

export const up = async (knex: Knex) => {
  await knex.raw(`
    UPDATE programming_sub_plans sp
    SET stages = COALESCE((SELECT array_agg(DISTINCT m.stage)
                           FROM unnest(sp.stages) ss
                                  JOIN (VALUES ${mappingValues}) AS m(sub_stage, stage)
                                       ON m.sub_stage = ss), '{}')
  `);

  await knex.schema.alterTable('users', (table) => {
    table.specificType('stages', 'text[]').notNullable().defaultTo('{}');
  });

  await knex.raw(`
    UPDATE users
    SET stages = COALESCE((SELECT array_agg(DISTINCT s)
                           FROM programming_sub_plans sp,
                                unnest(sp.stages) s
                           WHERE sp.id = ANY (users.programming_sub_plan_ids)), '{}')
  `);

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('programming_sub_plan_ids');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table
      .specificType('programming_sub_plan_ids', 'uuid[]')
      .notNullable()
      .defaultTo('{}');
  });

  await knex.raw(`
    UPDATE users
    SET programming_sub_plan_ids = COALESCE((SELECT array_agg(sp.id)
                                             FROM programming_sub_plans sp
                                             WHERE sp.stages && users.stages), '{}')
  `);

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('stages');
  });

  await knex.raw(`
    UPDATE programming_sub_plans sp
    SET stages = COALESCE((SELECT array_agg(DISTINCT m.sub_stage ORDER BY m.sub_stage)
                           FROM unnest(sp.stages) s
                                  JOIN (VALUES ${mappingValues}) AS m(sub_stage, stage)
                                       ON m.stage = s), '{}')
  `);
};
