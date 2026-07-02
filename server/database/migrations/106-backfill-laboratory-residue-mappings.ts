import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    INSERT INTO laboratory_residue_mappings (laboratory_id, label, ssd2_id)
    SELECT DISTINCT si.laboratory_id, ar.unknown_label, NULL
    FROM analysis_residues ar
    JOIN analysis a ON a.id = ar.analysis_id
    JOIN sample_items si ON si.sample_id = a.sample_id
    WHERE ar.unknown_label IS NOT NULL
      AND si.recipient_kind = 'Laboratory'
    ON CONFLICT (laboratory_id, label) DO NOTHING
  `);
};

export const down = async () => {};
