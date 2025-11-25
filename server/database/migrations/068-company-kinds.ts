import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('companies', (table) => {
    table.specificType('kinds', 'text[]');
  });

  await knex('companies').update({
    kinds: knex.raw(
      "CASE WHEN kind IS NULL THEN '{}' ELSE ARRAY[kind]::text[] END"
    )
  });

  await knex.schema.alterTable('companies', (table) => {
    table.dropColumn('kind');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('companies', (table) => {
    table.string('kind');
  });

  await knex('companies').update({
    kind: knex.raw('kinds[1]')
  });

  await knex.schema.alterTable('companies', (table) => {
    table.dropColumn('kinds');
  });
};
