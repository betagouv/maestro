import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    UPDATE sample_specific_data_values sdv
    SET option_id = sdfo.id, value = NULL
    FROM specific_data_fields sdf
    JOIN specific_data_field_options sdfo ON sdfo.field_key = sdf.key
    WHERE sdf.id = sdv.field_id
      AND sdv.option_id IS NULL
      AND sdfo.value = sdv.value
  `);

  await knex.raw(`
    ALTER TABLE sample_specific_data_values
    DROP CONSTRAINT sample_specific_data_values_sample_id_field_id_unique
  `);
  await knex.raw(`
    ALTER TABLE sample_specific_data_values
    ADD CONSTRAINT sample_specific_data_values_sample_field_option_unique
    UNIQUE NULLS NOT DISTINCT (sample_id, field_id, option_id)
  `);
};

export const down = async (knex: Knex) => {
  await knex.raw(`
    DELETE FROM sample_specific_data_values sdv
    USING sample_specific_data_values other
    WHERE sdv.sample_id = other.sample_id
      AND sdv.field_id = other.field_id
      AND sdv.id > other.id
  `);
  await knex.raw(`
    ALTER TABLE sample_specific_data_values
    DROP CONSTRAINT sample_specific_data_values_sample_field_option_unique
  `);
  await knex.raw(`
    ALTER TABLE sample_specific_data_values
    ADD CONSTRAINT sample_specific_data_values_sample_id_field_id_unique
    UNIQUE (sample_id, field_id)
  `);
};
