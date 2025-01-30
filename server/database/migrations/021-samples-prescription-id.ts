import { Knex } from 'knex';
import { RegionList, Regions } from 'maestro-shared/referential/Region';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.uuid('prescription_id').references('id').inTable('prescriptions');
    table.string('region');
  });

  await knex('samples')
    .updateFrom('prescriptions')
    .where(
      'samples.programming_plan_id',
      knex.ref('prescriptions.programming_plan_id')
    )
    .where('samples.context', knex.ref('prescriptions.context'))
    .where('samples.matrix', knex.ref('prescriptions.matrix'))
    .where(knex.raw('samples.stage = any(prescriptions.stages)'))
    .update({
      prescription_id: knex.ref('prescriptions.id')
    });

  await knex('samples').update({
    region: knex.raw(
      `case ${RegionList.map(
        (region) =>
          `when '${Regions[region].shortName}' = split_part(samples.reference, '-', 1) then '${region}'`
      ).join(' ')} end`
    )
  });

  await knex.schema.alterTable('samples', (table) => {
    table.string('region').notNullable().alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('prescription_id');
    table.dropColumn('region');
  });
};
