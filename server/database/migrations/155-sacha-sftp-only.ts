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

  await knex.raw(
    'ALTER TABLE analysis_dai DROP CONSTRAINT analysis_dai_state_check'
  );
  await knex.raw(`
    ALTER TABLE analysis_dai
    ADD CONSTRAINT analysis_dai_state_check
    CHECK (state IN ('PENDING', 'QUEUED', 'SENT', 'ERROR'))
  `);

  await knex.raw(`
    CREATE TABLE sacha_outgoing_file (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      file_type text NOT NULL CHECK (file_type IN ('DA01', 'AN01')),
      file_name text NOT NULL UNIQUE,
      laboratory_id uuid NOT NULL REFERENCES laboratories (id),
      document_id uuid NOT NULL REFERENCES documents (id),
      analysis_dai_id uuid REFERENCES analysis_dai (id) ON DELETE CASCADE,
      analysis_rai_id uuid REFERENCES analysis_rai (id) ON DELETE CASCADE,
      zip_name text,
      deposited_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT current_timestamp,
      CONSTRAINT sacha_outgoing_file_link_check CHECK (
        (file_type = 'DA01' AND analysis_dai_id IS NOT NULL AND analysis_rai_id IS NULL)
        OR (file_type = 'AN01' AND analysis_rai_id IS NOT NULL AND analysis_dai_id IS NULL)
      ),
      CONSTRAINT sacha_outgoing_file_deposit_check CHECK (
        (zip_name IS NULL) = (deposited_at IS NULL)
      )
    )
  `);
  await knex.raw(`
    CREATE INDEX sacha_outgoing_file_undeposited_idx
    ON sacha_outgoing_file (file_type)
    WHERE deposited_at IS NULL
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw('DROP TABLE sacha_outgoing_file');

  await knex.raw(
    'ALTER TABLE analysis_dai DROP CONSTRAINT analysis_dai_state_check'
  );
  await knex.raw(
    "UPDATE analysis_dai SET state = 'PENDING' WHERE state = 'QUEUED'"
  );
  await knex.raw(`
    ALTER TABLE analysis_dai
    ADD CONSTRAINT analysis_dai_state_check
    CHECK (state IN ('PENDING', 'SENT', 'ERROR'))
  `);

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
