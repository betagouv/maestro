import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('laboratories', (table) => {
    table.boolean('legacy_dai').notNullable().defaultTo(false);
    table.boolean('sacha_activated').notNullable().defaultTo(false);
    table.text('sacha_communication_method').nullable();
  });

  await knex('laboratories')
    .whereIn('short_name', ['ANS 94a - LNR PEST', 'ANS 94a - LNR ETM'])
    .update({ legacy_dai: true });

  await knex('laboratories')
    .whereNotNull('sacha_sftp_login')
    .update({ sacha_communication_method: 'SFTP' });

  await knex('laboratories')
    .whereNotNull('sacha_gpg_public_key')
    .whereNotNull('sacha_email')
    .update({ sacha_communication_method: 'EMAIL' });

  await knex.raw(`
    ALTER TABLE laboratories
    ADD CONSTRAINT laboratories_sacha_consistency_check CHECK (
      (legacy_dai = true
        AND sacha_activated = false
        AND sacha_communication_method IS NULL
        AND sacha_email IS NULL
        AND sacha_gpg_public_key IS NULL
        AND sacha_sftp_login IS NULL
        AND sacha_sigle IS NULL)
      OR (legacy_dai = false
        AND (
          sacha_communication_method IS NULL
          OR (sacha_communication_method = 'EMAIL'
            AND sacha_email IS NOT NULL
            AND sacha_gpg_public_key IS NOT NULL)
          OR (sacha_communication_method = 'SFTP'
            AND sacha_sftp_login IS NOT NULL)
        ))
    )
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(
    'ALTER TABLE laboratories DROP CONSTRAINT laboratories_sacha_consistency_check'
  );

  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('sacha_communication_method');
    table.dropColumn('sacha_activated');
    table.dropColumn('legacy_dai');
  });
};
