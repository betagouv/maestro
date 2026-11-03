import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(
    'ALTER TABLE laboratories DROP CONSTRAINT laboratories_sacha_consistency_check'
  );

  await knex.schema.alterTable('laboratories', (table) => {
    table.dropColumn('sacha_gpg_email');
    table.dropColumn('sacha_gpg_public_key');
    table.dropColumn('sacha_sftp_login');
    table.dropColumn('sacha_communication_method');
  });

  await knex.raw(`
    ALTER TABLE laboratories
    ADD CONSTRAINT laboratories_sacha_consistency_check CHECK (
      (legacy_dai = true
        AND sacha_activated = false
        AND sacha_sigle IS NULL
        AND sacha_recipient_email IS NULL)
      OR legacy_dai = false
    )
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(
    'ALTER TABLE laboratories DROP CONSTRAINT laboratories_sacha_consistency_check'
  );

  await knex.schema.alterTable('laboratories', (table) => {
    table.text('sacha_gpg_email').nullable();
    table.text('sacha_gpg_public_key').nullable();
    table.text('sacha_sftp_login').nullable();
    table.text('sacha_communication_method').nullable();
  });

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
            AND sacha_recipient_email IS NOT NULL)
          OR (sacha_communication_method = 'SFTP'
            AND sacha_sftp_login IS NOT NULL)
        ))
    )
  `);
};
