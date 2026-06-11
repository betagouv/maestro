import type { Knex } from 'knex';

const dataByCodeNat: Record<
  string,
  {
    label: string;
    analysisPermissionRole: string | null;
    contactListId: number | null;
    withSacha: boolean;
  }
> = {
  PPV: {
    label: 'Production primaire végétale',
    analysisPermissionRole: 'Sampler',
    contactListId: 7,
    withSacha: false
  },
  M01: {
    label: 'Abattoir / Viande de volaille',
    analysisPermissionRole: 'DepartmentalCoordinator',
    contactListId: 9,
    withSacha: true
  },
  M02: {
    label: 'Abattoir / Foie de bovin',
    analysisPermissionRole: 'DepartmentalCoordinator',
    contactListId: 9,
    withSacha: true
  }
};

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('programming_sub_plans', (table) => {
    table.string('label').nullable();
    table.string('analysis_permission_role').nullable();
    table.integer('contact_list_id').nullable();
    table.boolean('with_sacha').nullable();
  });

  for (const [codeNat, data] of Object.entries(dataByCodeNat)) {
    await knex('programming_sub_plans').where({ codeNat }).update({
      label: data.label,
      analysisPermissionRole: data.analysisPermissionRole,
      contactListId: data.contactListId,
      withSacha: data.withSacha
    });
  }

  await knex.schema.alterTable('programming_sub_plans', (table) => {
    table.string('label').notNullable().alter();
    table.boolean('with_sacha').notNullable().defaultTo(false).alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('programming_sub_plans', (table) => {
    table.dropColumn('label');
    table.dropColumn('analysis_permission_role');
    table.dropColumn('contact_list_id');
    table.dropColumn('with_sacha');
  });
};
