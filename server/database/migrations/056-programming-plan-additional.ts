import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('title');
    table.string('domain');
    table.specificType('additional_substances', 'text[]');
    table.string('distribution_kind');
  });

  await knex('programming_plans')
    .whereRaw('kinds @> ?', [['PPV']])
    .update({
      title: 'Production primaire végétale',
      domain: 'PESTICIDE_RESIDUE',
      distribution_kind: 'REGIONAL'
    });

  await knex('programming_plans')
    .whereRaw('kinds @> ?', [['PFAS_EGGS', 'PFAS_MEAT']])
    .update({
      title: 'PFAS',
      domain: 'CHEMICAL_CONTAMINANT',
      distribution_kind: 'REGIONAL'
    });

  await knex('programming_plans')
    .whereRaw('kinds @> ?', [['DAOA_BREEDING', 'DAOA_SLAUGHTER']])
    .update({
      title: "Denrées d'origine animale",
      domain: 'PESTICIDE_RESIDUE',
      additional_substances: ['Analyse des cuivres'],
      distribution_kind: 'SLAUGHTERHOUSE'
    });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('title').notNullable().alter();
    table.string('domain').notNullable().alter();
    table.string('distribution_kind').notNullable().alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.dropColumn('title');
    table.dropColumn('domain');
    table.dropColumn('distribution_kind');
    table.dropColumn('additional_substances');
  });
};
