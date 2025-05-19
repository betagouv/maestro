import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  const samplesContextCheck = await knex.raw(`
      select exists (
        select 1
        FROM pg_constraint
        WHERE conname = 'samples_context_check'
      ) as "exists"
    `);

  await knex.schema.alterTable('samples', (table) => {
    if (samplesContextCheck.rows[0].exists) {
      table.dropChecks('samples_context_check');
    }
    table.specificType('mono_substances', 'text[]').nullable();
    table.specificType('multi_substances', 'text[]').nullable();
  });

  await knex.raw(`
    update samples
    set mono_substances = prescriptionMonoSubstances.substances,
        multi_substances = prescriptionMultiSubstances.substances
      from (
             select
               prescription_id,
               array_agg(substance_code) as substances
             from prescription_substances
             where analysis_method = 'Mono'
             group by prescription_id
           ) as prescriptionMonoSubstances,
           (
             select
               prescription_id,
               array_agg(substance_code) as substances
             from prescription_substances
             where analysis_method = 'Multi'
             group by prescription_id
           ) as prescriptionMultiSubstances
    where samples.prescription_id = prescriptionMonoSubstances.prescription_id
      and samples.prescription_id = prescriptionMultiSubstances.prescription_id
  `);

  const prescriptionSubstancesForeignCheck = await knex.raw(`
      select exists (
        select 1
        FROM pg_constraint
        WHERE conname = 'substance_analysis_substance_code_foreign'
      ) as "exists"
    `);

  await knex.schema.alterTable('prescription_substances', (table) => {
    if (prescriptionSubstancesForeignCheck.rows[0].exists) {
      table.dropForeign(
        'substance_code',
        'substance_analysis_substance_code_foreign'
      );
    }
    table.renameColumn('substance_code', 'substance');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescription_substances', (table) => {
    table.renameColumn('substance', 'substance_code');
  });
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('mono_substances');
    table.dropColumn('multi_substances');
  });
};
