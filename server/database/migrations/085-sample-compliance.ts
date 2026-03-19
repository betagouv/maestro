import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.string('compliance');
    table.text('notes_on_compliance');
  });

  await knex('samples')
    .updateFrom('analysis')
    .where('analysis.sample_id', knex.raw('samples.id'))
    .update({
      compliance: knex.raw(
        "CASE WHEN analysis.compliance = true THEN 'Compliant' WHEN analysis.compliance = false THEN 'NonCompliant' ELSE NULL END"
      )
    });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('compliance');
    table.dropColumn('notes_on_compliance');
  });
};
