import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('sacha_commemoratifs', (table) => {
    table.string('sigle').primary();
    table.string('cle').notNullable();
    table.string('libelle').notNullable();
    table.string('statut').notNullable();
    table.string('type_donnee');
    table.string('unite');
  });

  await knex.schema.createTable('sacha_commemoratif_values', (table) => {
    table.string('sigle').primary();
    table.string('commemoratif_sigle').notNullable();
    table.string('cle').notNullable();
    table.string('libelle').notNullable();
    table.string('statut').notNullable();

    table
      .foreign('commemoratif_sigle')
      .references('sigle')
      .inTable('sacha_commemoratifs')
      .onDelete('CASCADE');
    table.index(['commemoratif_sigle']);
  });

  await knex.schema.createTable('sample_specific_data_attribute', (table) => {
    table.string('attribute').notNullable();
    table.string('sacha_commemoratif_sigle').notNullable();
    table.boolean('in_dai').notNullable().defaultTo(false);

    table.primary(['attribute']);
    table
      .foreign('sacha_commemoratif_sigle')
      .references('sigle')
      .inTable('sacha_commemoratifs')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable(
    'sample_specific_data_attribute_value',
    (table) => {
      table.string('attribute').notNullable();
      table.string('attribute_value').notNullable();
      table.string('sacha_commemoratif_value_sigle').notNullable();

      table.primary(['attribute', 'attribute_value']);
      table
        .foreign(['attribute'])
        .references(['attribute'])
        .inTable('sample_specific_data_attribute')
        .onDelete('CASCADE');
      table
        .foreign('sacha_commemoratif_value_sigle')
        .references('sigle')
        .inTable('sacha_commemoratif_values')
        .onDelete('CASCADE');
    }
  );
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('sample_specific_data_attribute_value');
  await knex.schema.dropTable('sample_specific_data_attribute');
  await knex.schema.dropTable('sacha_commemoratif_values');
  await knex.schema.dropTable('sacha_commemoratifs');
};
