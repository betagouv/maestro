import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('sacha_contexts', (table) => {
    table.string('sigle').primary();
    table.text('libelle').notNullable();
    table.boolean('deprecated').notNullable().defaultTo(false);
  });

  await knex.schema.createTable('sacha_context_commemoratifs', (table) => {
    table.string('context_sigle').notNullable();
    table.string('commemoratif_sigle').notNullable();
    table.enu('level', ['Sample', 'SampleMatrix']).notNullable();
    table.boolean('deprecated').notNullable().defaultTo(false);

    table.primary(['context_sigle', 'commemoratif_sigle']);
    table
      .foreign('context_sigle')
      .references('sigle')
      .inTable('sacha_contexts')
      .onDelete('CASCADE');
    table
      .foreign('commemoratif_sigle')
      .references('sigle')
      .inTable('sacha_commemoratifs');
  });

  for (const tableName of [
    'sacha_commemoratifs',
    'sacha_commemoratif_values'
  ]) {
    await knex.schema.alterTable(tableName, (table) => {
      table.boolean('deprecated').notNullable().defaultTo(false);
    });
  }

  await knex.schema.alterTable('specific_data_fields', (table) => {
    table.dropColumn('sacha_in_dai');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('specific_data_fields', (table) => {
    table.boolean('sacha_in_dai').notNullable().defaultTo(false);
  });

  for (const tableName of [
    'sacha_commemoratifs',
    'sacha_commemoratif_values'
  ]) {
    await knex.schema.alterTable(tableName, (table) => {
      table.dropColumn('deprecated');
    });
  }

  await knex.schema.dropTable('sacha_context_commemoratifs');
  await knex.schema.dropTable('sacha_contexts');
};
