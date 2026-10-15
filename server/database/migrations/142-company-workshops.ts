import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('company_workshops', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('siret').notNullable();
    table.string('ate_identifiant').notNullable();
    table.string('ate_lb').notNullable();
    table.string('type_ident_eta');
    table.string('eta_id');
    table.string('eta_lb');
    table.string('ide_lb');
    table.string('adr_ligne1');
    table.string('cp_etab');
    table.string('commune_etab');
    table.string('cata_lbs');
    table.string('cata_lb');
    table.unique(['siret', 'ate_identifiant']);
    table.index('siret');
  });

  await knex.schema.alterTable('samples', (table) => {
    table
      .uuid('company_workshop_id')
      .nullable()
      .references('id')
      .inTable('company_workshops');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('company_workshop_id');
  });

  await knex.schema.dropTableIfExists('company_workshops');
};
