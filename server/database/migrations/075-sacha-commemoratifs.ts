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

    table.foreign('commemoratif_sigle').references('sigle').inTable('sacha_commemoratifs').onDelete('CASCADE');
    table.index(['commemoratif_sigle']);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('sacha_commemoratif_values');
  await knex.schema.dropTable('sacha_commemoratifs');
};
