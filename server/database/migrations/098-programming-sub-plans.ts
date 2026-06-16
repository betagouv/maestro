import type { Knex } from 'knex';

const codeNatByKind: Record<string, string> = {
  PPV: 'PPV',
  DAOA_VOLAILLE: 'M01',
  DAOA_BOVIN: 'M02'
};

const kindByCodeNat: Record<string, string> = Object.fromEntries(
  Object.entries(codeNatByKind).map(([kind, codeNat]) => [codeNat, kind])
);

const buildCaseExpr = (tableColumn: string): string =>
  `CASE ${tableColumn} ${Object.entries(codeNatByKind)
    .map(([kind, codeNat]) => `WHEN '${kind}' THEN '${codeNat}'`)
    .join(' ')} ELSE ${tableColumn} END`;

const buildReverseCaseExpr = (tableColumn: string): string =>
  `CASE ${tableColumn} ${Object.entries(kindByCodeNat)
    .map(([codeNat, kind]) => `WHEN '${codeNat}' THEN '${kind}'`)
    .join(' ')} ELSE ${tableColumn} END`;

const StagesByCodeNat: Record<string, string[]> = {
  PPV: [
    'STADE1',
    'STADE2',
    'STADE3',
    'STADE4',
    'STADE5',
    'STADE6',
    'STADE7',
    'STADE8',
    'STADE9'
  ],
  M01: ['STADE10'],
  M02: ['STADE10']
};

export const up = async (knex: Knex) => {
  // 1. Créer la table programming_sub_plans
  await knex.schema.createTable('programming_sub_plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('programming_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_plans')
      .onDelete('CASCADE');
    table.string('code_nat').notNullable();
    table.specificType('stages', 'text[]').notNullable().defaultTo('{}');
  });

  // 2. Migrer depuis programming_plan_kinds
  const existingKinds = await knex('programming_plan_kinds').select('*');
  if (existingKinds.length > 0) {
    const rows = existingKinds.map((row) => ({
      programming_plan_id: row.programmingPlanId,
      code_nat: codeNatByKind[row.kind] ?? row.kind,
      stages: StagesByCodeNat[codeNatByKind[row.kind] ?? row.kind] ?? []
    }));
    await knex('programming_sub_plans').insert(rows);
  }

  // 3. samples
  await knex.schema.alterTable('samples', (table) => {
    table
      .uuid('programming_sub_plan_id')
      .nullable()
      .references('id')
      .inTable('programming_sub_plans');
  });
  await knex('samples').update({
    programming_sub_plan_id: knex('programming_sub_plans')
      .select('id')
      .whereRaw(
        'programming_sub_plans.programming_plan_id = samples.programming_plan_id'
      )
      .whereRaw(
        `programming_sub_plans.code_nat = ${buildCaseExpr('samples.programming_plan_kind')}`
      )
      .limit(1)
  });
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('programming_plan_kind');
  });

  // 4. prescriptions
  await knex.schema.alterTable('prescriptions', (table) => {
    table.uuid('programming_sub_plan_id').nullable();
  });
  await knex('prescriptions').update({
    programming_sub_plan_id: knex('programming_sub_plans')
      .select('id')
      .whereRaw(
        'programming_sub_plans.programming_plan_id = prescriptions.programming_plan_id'
      )
      .whereRaw(
        `programming_sub_plans.code_nat = ${buildCaseExpr('prescriptions.programming_plan_kind')}`
      )
      .limit(1)
  });
  await knex.schema.alterTable('prescriptions', (table) => {
    table
      .uuid('programming_sub_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_sub_plans')
      .alter();
    table.dropColumn('programming_plan_kind');
  });

  // 5. laboratory_agreements
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.dropPrimary();
    table.uuid('programming_sub_plan_id').nullable();
  });
  await knex('laboratory_agreements').update({
    programming_sub_plan_id: knex('programming_sub_plans')
      .select('id')
      .whereRaw(
        'programming_sub_plans.programming_plan_id = laboratory_agreements.programming_plan_id'
      )
      .whereRaw(
        `programming_sub_plans.code_nat = ${buildCaseExpr('laboratory_agreements.programming_plan_kind')}`
      )
      .limit(1)
  });
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table
      .uuid('programming_sub_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_sub_plans')
      .alter();
    table.dropColumn('programming_plan_id');
    table.dropColumn('programming_plan_kind');
  });
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.primary([
      'laboratory_id',
      'programming_sub_plan_id',
      'substance_kind'
    ]);
  });

  // 6. laboratory_agreement_checks
  await knex.schema.alterTable('laboratory_agreement_checks', (table) => {
    table.dropPrimary();
    table.uuid('programming_sub_plan_id').nullable();
  });
  await knex('laboratory_agreement_checks').update({
    programming_sub_plan_id: knex('programming_sub_plans')
      .select('id')
      .whereRaw(
        'programming_sub_plans.programming_plan_id = laboratory_agreement_checks.programming_plan_id'
      )
      .whereRaw(
        `programming_sub_plans.code_nat = ${buildCaseExpr('laboratory_agreement_checks.programming_plan_kind')}`
      )
      .limit(1)
  });
  await knex.schema.alterTable('laboratory_agreement_checks', (table) => {
    table
      .uuid('programming_sub_plan_id')
      .notNullable()
      .references('id')
      .inTable('programming_sub_plans')
      .alter();
    table.dropColumn('programming_plan_id');
    table.dropColumn('programming_plan_kind');
  });
  await knex.schema.alterTable('laboratory_agreement_checks', (table) => {
    table.primary(['programming_sub_plan_id', 'substance_kind']);
  });

  // 7. users
  await knex.schema.alterTable('users', (table) => {
    table
      .specificType('programming_sub_plan_ids', 'uuid[]')
      .notNullable()
      .defaultTo('{}');
  });
  const kindToCodeNatCaseElem = buildCaseExpr('elem');
  await knex.raw(`
      UPDATE users
      SET programming_sub_plan_ids = (SELECT COALESCE(array_agg(sp.id), '{}')
                                      FROM programming_sub_plans sp
                                      WHERE sp.code_nat = ANY (
                                        SELECT ${kindToCodeNatCaseElem}
                                        FROM unnest(users.programming_plan_kinds) elem
                                      ))
  `);
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('programming_plan_kinds');
  });

  // 8. programming_plan_kind_fields
  await knex.schema.alterTable('programming_plan_kind_fields', (table) => {
    table
      .uuid('programming_sub_plan_id')
      .nullable()
      .references('id')
      .inTable('programming_sub_plans');
  });
  await knex('programming_plan_kind_fields').update({
    programming_sub_plan_id: knex('programming_sub_plans')
      .select('id')
      .whereRaw(
        'programming_sub_plans.programming_plan_id = programming_plan_kind_fields.programming_plan_id'
      )
      .whereRaw(
        `programming_sub_plans.code_nat = ${buildCaseExpr('programming_plan_kind_fields.kind')}`
      )
      .limit(1)
  });
  await knex.schema.alterTable('programming_plan_kind_fields', (table) => {
    table.uuid('programming_sub_plan_id').notNullable().alter();
    table.dropColumn('programming_plan_id');
    table.dropColumn('kind');
  });

  // 9. Renommer programming_plan_kind_fields → programming_sub_plan_fields
  await knex.schema.alterTable(
    'programming_plan_kind_field_options',
    (table) => {
      table.renameColumn(
        'programming_plan_kind_field_id',
        'programming_sub_plan_field_id'
      );
    }
  );
  await knex.schema.renameTable(
    'programming_plan_kind_field_options',
    'programming_sub_plan_field_options'
  );
  await knex.schema.renameTable(
    'programming_plan_kind_fields',
    'programming_sub_plan_fields'
  );

  // 10. Supprimer l'ancienne table
  await knex.schema.dropTable('programming_plan_kinds');
};

export const down = async (knex: Knex) => {
  await knex.schema.createTable('programming_plan_kinds', (table) => {
    table.uuid('programming_plan_id').notNullable();
    table.string('kind').notNullable();
    table.primary(['programming_plan_id', 'kind']);
  });

  const subPlans = await knex('programming_sub_plans').select(
    'programming_plan_id',
    'code_nat'
  );
  const uniqueKinds = [
    ...new Map(
      subPlans.map((row) => [
        `${row.programmingPlanId}:${row.codeNat}`,
        {
          programming_plan_id: row.programmingPlanId,
          kind: kindByCodeNat[row.codeNat] ?? row.codeNat
        }
      ])
    ).values()
  ];
  // Insérer par chunks de 500 pour éviter le dépassement de paramètres PostgreSQL
  const chunkSize = 500;
  for (let i = 0; i < uniqueKinds.length; i += chunkSize) {
    await knex('programming_plan_kinds').insert(
      uniqueKinds.slice(i, i + chunkSize)
    );
  }

  // Restaurer les colonnes (opération partielle — sans garantie de cohérence)
  await knex.schema.alterTable('samples', (table) => {
    table.string('programming_plan_kind').nullable();
  });
  await knex('samples').update({
    programming_plan_kind: knex('programming_sub_plans')
      .select(knex.raw(buildReverseCaseExpr('code_nat')))
      .whereRaw('programming_sub_plans.id = samples.programming_sub_plan_id')
      .limit(1)
  });
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('programming_sub_plan_id');
  });

  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('programming_plan_kind').nullable();
  });
  await knex('prescriptions').update({
    programming_plan_kind: knex('programming_sub_plans')
      .select(knex.raw(buildReverseCaseExpr('code_nat')))
      .whereRaw(
        'programming_sub_plans.id = prescriptions.programming_sub_plan_id'
      )
      .limit(1)
  });
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('programming_sub_plan_id');
  });

  // Restaurer laboratory_agreements
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.dropPrimary();
    table.uuid('programming_plan_id').nullable();
    table.string('programming_plan_kind').nullable();
  });
  await knex('laboratory_agreements').update({
    programming_plan_kind: knex('programming_sub_plans')
      .select(knex.raw(buildReverseCaseExpr('code_nat')))
      .whereRaw(
        'programming_sub_plans.id = laboratory_agreements.programming_sub_plan_id'
      )
      .limit(1),
    programming_plan_id: knex('programming_sub_plans')
      .select('programming_plan_id')
      .whereRaw(
        'programming_sub_plans.id = laboratory_agreements.programming_sub_plan_id'
      )
      .limit(1)
  });
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.dropColumn('programming_sub_plan_id');
  });
  await knex.schema.alterTable('laboratory_agreements', (table) => {
    table.primary([
      'laboratory_id',
      'programming_plan_id',
      'programming_plan_kind',
      'substance_kind'
    ]);
  });

  // Restaurer laboratory_agreement_checks
  await knex.schema.alterTable('laboratory_agreement_checks', (table) => {
    table.dropPrimary();
    table.uuid('programming_plan_id').nullable();
    table.string('programming_plan_kind').nullable();
  });
  await knex('laboratory_agreement_checks').update({
    programming_plan_kind: knex('programming_sub_plans')
      .select(knex.raw(buildReverseCaseExpr('code_nat')))
      .whereRaw(
        'programming_sub_plans.id = laboratory_agreement_checks.programming_sub_plan_id'
      )
      .limit(1),
    programming_plan_id: knex('programming_sub_plans')
      .select('programming_plan_id')
      .whereRaw(
        'programming_sub_plans.id = laboratory_agreement_checks.programming_sub_plan_id'
      )
      .limit(1)
  });
  await knex.schema.alterTable('laboratory_agreement_checks', (table) => {
    table.dropColumn('programming_sub_plan_id');
  });
  await knex.schema.alterTable('laboratory_agreement_checks', (table) => {
    table.primary([
      'programming_plan_id',
      'programming_plan_kind',
      'substance_kind'
    ]);
  });

  // Restaurer les noms de tables programming_sub_plan_fields → programming_plan_kind_fields
  await knex.schema.renameTable(
    'programming_sub_plan_fields',
    'programming_plan_kind_fields'
  );
  await knex.schema.renameTable(
    'programming_sub_plan_field_options',
    'programming_plan_kind_field_options'
  );
  await knex.schema.alterTable(
    'programming_plan_kind_field_options',
    (table) => {
      table.renameColumn(
        'programming_sub_plan_field_id',
        'programming_plan_kind_field_id'
      );
    }
  );

  // Restaurer programming_plan_kind_fields
  await knex.schema.alterTable('programming_plan_kind_fields', (table) => {
    table.uuid('programming_plan_id').nullable();
    table.string('kind').nullable();
  });
  await knex('programming_plan_kind_fields').update({
    kind: knex('programming_sub_plans')
      .select(knex.raw(buildReverseCaseExpr('code_nat')))
      .whereRaw(
        'programming_sub_plans.id = programming_plan_kind_fields.programming_sub_plan_id'
      )
      .limit(1),
    programming_plan_id: knex('programming_sub_plans')
      .select('programming_plan_id')
      .whereRaw(
        'programming_sub_plans.id = programming_plan_kind_fields.programming_sub_plan_id'
      )
      .limit(1)
  });
  await knex.schema.alterTable('programming_plan_kind_fields', (table) => {
    table.dropColumn('programming_sub_plan_id');
  });

  // Restaurer users.programming_plan_kinds
  await knex.schema.alterTable('users', (table) => {
    table
      .specificType('programming_plan_kinds', 'text[]')
      .nullable()
      .defaultTo('{}');
  });
  const codeNatToKindCaseCol = buildReverseCaseExpr('sp.code_nat');
  await knex.raw(`
      UPDATE users
      SET programming_plan_kinds = (SELECT COALESCE(array_agg(${codeNatToKindCaseCol}), '{}')
                                    FROM programming_sub_plans sp
                                    WHERE sp.id = ANY (users.programming_sub_plan_ids))
  `);
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('programming_sub_plan_ids');
  });

  await knex.raw('DROP TABLE programming_sub_plans CASCADE');
};
