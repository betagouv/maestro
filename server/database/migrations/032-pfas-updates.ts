import { Knex } from 'knex';
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.text('domain');
    table.specificType('contexts', 'text[]');
  });

  await knex('programming_plans').update({
    domain: 'PPV',
    contexts: ['Control', 'Surveillance']
  });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('domain').notNullable().alter();
    table.specificType('contexts', 'text[]').notNullable().alter();
    table.dropUnique(['year']);
    table.unique(['domain', 'year']);
  });

  await knex.schema.alterTable('users', (table) => {
    table.string('domain');
  });

  await knex('users').update({ domain: 'PPV' });

  await knex.schema.alterTable('users', (table) => {
    table.string('domain').notNullable().alter();
  });
  await knex.schema.alterTable('samples', (table) => {
    table.json('specific_data');
  });

  await knex.raw(`
    UPDATE samples
    SET specific_data = json_build_object('domain', 'PPV', 'cultureKind', culture_kind, 'releaseControl', release_control)
  `);
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('specific_data');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('domain');
  });

  const deletedProgrammingPlans = await knex('programming_plans').whereNot(
    'domain',
    'PPV'
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
    table.dropUnique(['domain', 'year']);
    table.dropColumn('domain');
    table.dropColumn('contexts');
    table.unique(['year']);
  });
};
