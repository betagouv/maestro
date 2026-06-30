import type { Knex } from 'knex';

const COMPLIANCE_VALUES = [
  'Compliant',
  'NonCompliant',
  'Other',
  'CompliantWithoutThreshold',
  'ToMonitor',
  'Uninterpretable'
];
const COMPLIANCE_VALUES_PPV = ['Compliant', 'NonCompliant', 'Other'];

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('analysis_residues', (table) => {
    table.enum('analysis_kind', ['SCREENING', 'CONFIRMATION']).nullable();
    table.double('ld').nullable();
    table.double('lq').nullable();
    table.boolean('accredited').nullable();
    table.text('precise_method').nullable();
  });

  await knex.raw(
    `alter table analysis_residues drop constraint analysis_residues_compliance_check`
  );
  await knex.raw(
    `alter table analysis_residues add constraint analysis_residues_compliance_check
       check (compliance = any (array[${COMPLIANCE_VALUES.map((v) => `'${v}'::text`).join(', ')}]))`
  );
};

export const down = async (knex: Knex) => {
  await knex.raw(
    `alter table analysis_residues drop constraint analysis_residues_compliance_check`
  );
  await knex.raw(
    `alter table analysis_residues add constraint analysis_residues_compliance_check
       check (compliance = any (array[${COMPLIANCE_VALUES_PPV.map((v) => `'${v}'::text`).join(', ')}]))`
  );

  await knex.schema.alterTable('analysis_residues', (table) => {
    table.dropColumn('analysis_kind');
    table.dropColumn('ld');
    table.dropColumn('lq');
    table.dropColumn('accredited');
    table.dropColumn('precise_method');
  });
};
