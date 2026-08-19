import type { Knex } from 'knex';

const PesticideResidueDomainId = '09a95048-64fe-46a1-8543-50146c6ab337';
const ChemicalContaminantDomainId = 'be1fb96c-e498-4e7a-bd2b-cd3d808f997f';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('programming_plan_domains', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.text('label').notNullable();
  });

  await knex('programming_plan_domains').insert([
    { id: PesticideResidueDomainId, label: 'Résidus de pesticides' },
    { id: ChemicalContaminantDomainId, label: 'Contaminants chimiques' }
  ]);

  await knex.schema.alterTable('programming_plans', (table) => {
    table.uuid('domain_id').nullable();
  });

  await knex('programming_plans')
    .where({ domain: 'PESTICIDE_RESIDUE' })
    .update({ domain_id: PesticideResidueDomainId });

  await knex('programming_plans')
    .where({ domain: 'CHEMICAL_CONTAMINANT' })
    .update({ domain_id: ChemicalContaminantDomainId });

  await knex.raw(`
    INSERT INTO programming_plan_domains (label)
    SELECT DISTINCT p.domain FROM programming_plans p
    WHERE p.domain_id IS NULL AND p.domain <> 'TO_BE_DEFINED'
  `);

  await knex.raw(`
    UPDATE programming_plans p SET domain_id = d.id
    FROM programming_plan_domains d
    WHERE p.domain_id IS NULL AND d.label = p.domain
  `);

  await knex.schema.alterTable('programming_plans', (table) => {
    table
      .foreign('domain_id')
      .references('id')
      .inTable('programming_plan_domains')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');
    table.dropColumn('domain');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('domain').nullable();
  });

  await knex.raw(`
    UPDATE programming_plans p SET domain = d.label
    FROM programming_plan_domains d WHERE p.domain_id = d.id
  `);

  await knex('programming_plans')
    .where({ domain: 'Résidus de pesticides' })
    .update({ domain: 'PESTICIDE_RESIDUE' });

  await knex('programming_plans')
    .where({ domain: 'Contaminants chimiques' })
    .update({ domain: 'CHEMICAL_CONTAMINANT' });

  await knex('programming_plans')
    .whereNull('domain')
    .update({ domain: 'TO_BE_DEFINED' });

  await knex.schema.alterTable('programming_plans', (table) => {
    table.string('domain').notNullable().alter();
    table.dropColumn('domain_id');
  });

  await knex.schema.dropTable('programming_plan_domains');
};
