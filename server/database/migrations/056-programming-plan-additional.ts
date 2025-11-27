import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('title');
    table.string('domain');
    table.specificType('substance_kinds', 'text[]').defaultTo('{}');
    table.string('distribution_kind');
  });

  await knex('programming_plans')
    .whereRaw('kinds @> ?', [['PPV']])
    .update({
      title: 'Production primaire végétale',
      domain: 'PESTICIDE_RESIDUE',
      substance_kinds: ['Any'],
      distribution_kind: 'REGIONAL'
    });

  await knex('programming_plans')
    .whereRaw('kinds @> ?', [['PFAS_EGGS', 'PFAS_MEAT']])
    .update({
      title: 'PFAS',
      domain: 'CHEMICAL_CONTAMINANT',
      substance_kinds: ['Any'],
      distribution_kind: 'REGIONAL'
    });

  await knex('programming_plans')
    .whereRaw('kinds @> ?', [['DAOA_BREEDING', 'DAOA_SLAUGHTER']])
    .update({
      title: "Produit carné à l'abattoir",
      domain: 'PESTICIDE_RESIDUE',
      substance_kinds: ['Mono', 'Multi', 'Copper'],
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
    table.dropColumn('substance_kinds');
  });
};
