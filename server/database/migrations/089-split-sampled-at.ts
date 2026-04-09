import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('samples', (table) => {
    table.string('sampled_date', 10).nullable();
    table.string('sampled_time', 5).nullable();
    table.renameColumn('sampled_at', 'sampled_at_deprecated');
  });

  await knex.raw(`
    UPDATE samples
    SET
      sampled_date = (sampled_at_deprecated AT TIME ZONE 'Europe/Paris')::date,
      sampled_time = to_char(sampled_at_deprecated AT TIME ZONE 'Europe/Paris', 'HH24:MI')
    WHERE sampled_at_deprecated IS NOT NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('samples', (table) => {
    table.renameColumn('sampled_at_deprecated', 'sampled_at');
  });

  await knex.raw(`
    UPDATE samples
    SET sampled_at = (sampled_date || 'T' || sampled_time || ':00')::timestamptz AT TIME ZONE 'Europe/Paris'
    WHERE sampled_date IS NOT NULL
  `);

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('sampled_date');
    table.dropColumn('sampled_time');
  });
}
