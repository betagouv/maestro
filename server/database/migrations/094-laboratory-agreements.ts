import type { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.text('programming_plan_kind');
    table.boolean('reference_laboratory').notNullable().defaultTo(false);
    table.boolean('detection_analysis').notNullable().defaultTo(false);
    table.boolean('confirmation_analysis').notNullable().defaultTo(false);
    table.dropPrimary();
  });

  const PPVProgrammingPlanIds = await knex('programming_plan_kinds')
    .select('programming_plan_id')
    .distinct()
    .where('kind', 'PPV');

  await knex('laboratory_agreements')
    .update({
      programming_plan_kind: 'PPV',
      detection_analysis: true
    })
    .whereIn(
      'programming_plan_id',
      PPVProgrammingPlanIds.map(({ programmingPlanId }) => programmingPlanId)
    );
  await knex('laboratory_agreements')
    .update({
      programming_plan_kind: 'DAOA_VOLAILLE',
      detection_analysis: true
    })
    .whereNotIn(
      'programming_plan_id',
      PPVProgrammingPlanIds.map(({ programmingPlanId }) => programmingPlanId)
    );

  const ANS94aId = await knex('laboratories')
    .select('id')
    .where('short_name', 'ANS 94a - LNR PEST')
    .first();

  const LDA85Id = await knex('laboratories')
    .select('id')
    .where('short_name', 'LDA 85')
    .first();

  const DAOAProgrammingPlanIds = await knex('programming_plan_kinds')
    .select('programming_plan_id')
    .distinct()
    .where('kind', 'DAOA_BOVIN');

  if (DAOAProgrammingPlanIds.length) {
    await knex('laboratory_agreements').insert(
      DAOAProgrammingPlanIds.flatMap(({ programmingPlanId }) => [
        {
          laboratory_id: ANS94aId.id,
          programming_plan_id: programmingPlanId,
          programming_plan_kind: 'DAOA_BOVIN',
          substance_kind: 'Mono',
          detection_analysis: true
        },
        {
          laboratory_id: ANS94aId.id,
          programming_plan_id: programmingPlanId,
          programming_plan_kind: 'DAOA_BOVIN',
          substance_kind: 'Multi',
          detection_analysis: true
        },
        {
          laboratory_id: LDA85Id?.id,
          programming_plan_id: programmingPlanId,
          programming_plan_kind: 'DAOA_BOVIN',
          substance_kind: 'Copper',
          detection_analysis: true
        }
      ])
    );
  }

  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.primary([
      'laboratory_id',
      'programming_plan_id',
      'programming_plan_kind',
      'substance_kind'
    ]);
  });
};

export const down = async (knex: Knex) => {
  // 1. Supprimer les lignes ajoutées par up (DAOA_BOVIN)
  await knex('laboratory_agreements')
    .where({
      programming_plan_kind: 'DAOA_BOVIN'
    })
    .delete();

  // 2. Dédoublonner AVANT de modifier la table pour éviter les problèmes
  //    de protocole PostgreSQL lors du mélange DDL/DML dans la même transaction
  await knex.raw(`
    WITH duplicates AS (
      SELECT ctid
      FROM (
        SELECT ctid,
               ROW_NUMBER() OVER (
                 PARTITION BY laboratory_id, programming_plan_id, substance_kind
                 ORDER BY ctid
               ) AS rn
        FROM laboratory_agreements
      ) t
      WHERE rn > 1
    )
    DELETE FROM laboratory_agreements
    WHERE ctid IN (SELECT ctid FROM duplicates)
  `);

  // 3. Supprimer la clé primaire et les colonnes ajoutées par up
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.dropPrimary();
    table.dropColumn('programming_plan_kind');
    table.dropColumn('reference_laboratory');
    table.dropColumn('detection_analysis');
    table.dropColumn('confirmation_analysis');
  });

  // 4. Restaurer la clé primaire d'origine
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.primary(['laboratory_id', 'programming_plan_id', 'substance_kind']);
  });
};
