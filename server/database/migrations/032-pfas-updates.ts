import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('kinds', 'text[]');
    table.specificType('contexts', 'text[]');
  });

  await knex('programming_plans').update({
    kinds: ['PPV'],
    contexts: ['Control', 'Surveillance']
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('kinds', 'text[]').notNullable().alter();
    table.specificType('contexts', 'text[]').notNullable().alter();
    table.dropUnique(['year']);
  });

  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('programming_plan_kind');
  });

  await knex('prescriptions').update({ programming_plan_kind: 'PPV' });

  await knex.schema.alterTable('prescriptions', (table) => {
    table.string('programming_plan_kind').notNullable().alter();
  });

  await knex.schema.alterTable('users', (table) => {
    table.specificType('programming_plan_kinds', 'text[]');
  });

  await knex('users').update({ programming_plan_kinds: ['PPV'] });

  await knex.schema.alterTable('users', (table) => {
    table
      .specificType('programming_plan_kinds', 'text[]')
      .notNullable()
      .alter();
  });
  await knex.schema.alterTable('samples', (table) => {
    table.json('specific_data');
  });

  await knex.raw(`
    UPDATE samples
    SET specific_data = 
        json_build_object(
            'programmingPlanKind', 'PPV', 
            'matrixDetails', matrix_details,
            'matrixPart', matrix_part,
            'cultureKind', culture_kind, 
            'releaseControl', release_control
        )
  `);

  await knex.schema.alterTable('samples', (table) => {
    table.json('specific_data').notNullable().alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('specific_data');
  });

  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('programming_plan_kind');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('programming_plan_kinds');
  });

  const deletedProgrammingPlans = await knex('programming_plans').whereNot(
    'kinds',
    '@>',
    ['PPV']
  );

  await knex('samples')
    .whereIn(
      'programming_plan_id',
      deletedProgrammingPlans.map((pp) => pp.id)
    )
    .delete();

  await knex('prescriptions')
    .whereIn(
      'programming_plan_id',
      deletedProgrammingPlans.map((pp) => pp.id)
    )
    .delete();

  await knex('programming_plans')
    .whereIn(
      'id',
      deletedProgrammingPlans.map((pp) => pp.id)
    )
    .delete();

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('kinds');
    table.dropColumn('contexts');
    table.unique(['year']);
  });
};
