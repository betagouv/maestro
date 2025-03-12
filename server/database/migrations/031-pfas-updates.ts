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
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('domain');
  });

  await knex('programming_plans').delete().whereNot('domain', 'PPV');

  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropUnique(['domain', 'year']);
    table.dropColumn('domain');
    table.dropColumn('contexts');
    table.unique(['year']);
  });
};
