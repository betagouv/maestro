import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.specificType('legal_contexts', 'text[]');
  });

  await knex('programming_plans')
    .update({
      legal_contexts: ['A', 'B']
    })
    .where({ kinds: ['PPV'] });
  await knex('programming_plans')
    .update({
      legal_contexts: ['A']
    })
    .whereNot({ kinds: ['PPV'] });

  await knex.schema.alterTable('programming_plans', (table) =>
    table.specificType('legal_contexts', 'text[]').notNullable().alter()
  );
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('legal_contexts');
  });
};
