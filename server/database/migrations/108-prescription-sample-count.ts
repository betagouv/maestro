import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.integer('sample_count').nullable();
  });

  await knex.raw(`
    UPDATE prescriptions p
    SET sample_count = COALESCE((
      SELECT SUM(lp.sample_count)
      FROM local_prescriptions lp
      WHERE lp.prescription_id = p.id
        AND lp.department = 'None'
        AND lp.company_siret = 'None'
    ), 0)
  `);

  await knex.schema.alterTable('prescriptions', (table) => {
    table.integer('sample_count').notNullable().defaultTo(0).alter();
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('prescriptions', (table) => {
    table.dropColumn('sample_count');
  });
};
