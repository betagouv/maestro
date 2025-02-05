import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.string('matrix_kind');
  });

  await knex('samples').update({ matrix_kind: knex.raw('matrix') });

  await knex.schema.alterTable('prescriptions', (table) => {
    table.renameColumn('matrix', 'matrix_kind');
  });

  const lastProgrammingPlanId = await knex('programming_plans')
    .select('id')
    .where({
      year: '2025'
    })
    .first();

  const changes = [
    ['A00FX', 'A00FT'],
    ['A03NJ', 'A01GG'],
    ['A00KE', 'A00KF'],
    ['A001D', 'A001C'],
    ['A012B', 'A011Z'],
    ['A04MA', 'A0DHZ'],
    ['A00HQ', 'A0DMX'],
    ['A010V', 'A0CXP'],
    ['A00PX', 'A00PC'],
    ['A01BQ', 'A01HH'],
    ['A00TQ', 'A00TP'],
    ['A00JN', 'A00JL'],
    ['A000L', 'A000R'],
    ['A04JS', 'A01LC'],
    ['A00LD', 'A0DJL'],
    ['A042C', 'A0DLB']
  ];

  await Promise.all(
    changes.map(([matrixKind, oldMatrixKind]) =>
      knex('prescriptions').update({ matrix_kind: matrixKind }).where({
        matrix_kind: oldMatrixKind,
        programming_plan_id: lastProgrammingPlanId.id
      })
    )
  );
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.renameColumn('matrix_kind', 'matrix');
  });
};
