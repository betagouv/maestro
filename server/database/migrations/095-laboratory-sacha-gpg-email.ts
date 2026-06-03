import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(
    'ALTER TABLE laboratories DROP CONSTRAINT laboratories_sacha_consistency_check'
  );

  await knex.schema.alterTable('laboratories', (table) => {
    table.renameColumn('sacha_email', 'sacha_recipient_email');
    table.text('sacha_gpg_email').nullable();
  });

  await knex('laboratories')
    .whereNotNull('sacha_recipient_email')
    .update({ sacha_gpg_email: knex.ref('sacha_recipient_email') });

  await knex.raw(`
    ALTER TABLE laboratories
    ADD CONSTRAINT laboratories_sacha_consistency_check CHECK (
      (legacy_dai = true
        AND sacha_activated = false
        AND sacha_communication_method IS NULL
        AND sacha_recipient_email IS NULL
        AND sacha_gpg_email IS NULL
        AND sacha_gpg_public_key IS NULL
        AND sacha_sftp_login IS NULL
        AND sacha_sigle IS NULL)
      OR (legacy_dai = false
        AND (
          sacha_communication_method IS NULL
          OR (sacha_communication_method = 'EMAIL'
            AND sacha_recipient_email IS NOT NULL
            AND sacha_gpg_email IS NOT NULL
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
    table.dropColumn('sacha_gpg_email');
    table.renameColumn('sacha_recipient_email', 'sacha_email');
  });

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
