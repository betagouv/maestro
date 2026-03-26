import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('sample_specific_data_values', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('sample_id')
      .notNullable()
      .references('id')
      .inTable('samples')
      .onDelete('CASCADE');
    table
      .uuid('field_id')
      .notNullable()
      .references('id')
      .inTable('specific_data_fields')
      .onDelete('RESTRICT');
    table.text('value').nullable();
    table
      .uuid('option_id')
      .nullable()
      .references('id')
      .inTable('specific_data_field_options')
      .onDelete('RESTRICT');
    table.unique(['sample_id', 'field_id']);
  });

  await knex.raw(`
    INSERT INTO sample_specific_data_values (id, sample_id, field_id, value, option_id)
    SELECT
      uuid_generate_v4(),
      s.id,
      sdf.id,
      CASE WHEN sdfo.id IS NULL THEN kv.val ELSE NULL END,
      sdfo.id
    FROM samples s
    CROSS JOIN LATERAL jsonb_each_text(s.specific_data::jsonb) AS kv(key, val)
    JOIN specific_data_fields sdf ON sdf.key = kv.key
    LEFT JOIN specific_data_field_options sdfo
      ON sdfo.field_key = sdf.key AND sdfo.value = kv.val
    WHERE s.specific_data IS NOT NULL
      AND s.specific_data::text != 'null'
      AND s.specific_data::text != '{}'
  `);

  await knex.schema.alterTable('samples', (table) => {
    table.dropColumn('specific_data');
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('samples', (table) => {
    table.json('specific_data').nullable();
  });

  await knex.raw(`
    UPDATE samples s
    SET specific_data = COALESCE(
      (
        SELECT jsonb_object_agg(sdf.key, CASE sdf.input_type
          WHEN 'checkbox' THEN to_jsonb(sdv.value = 'true')
          WHEN 'number' THEN to_jsonb(sdv.value::numeric)
          ELSE COALESCE(to_jsonb(sdv.value), to_jsonb(sdfo.value))
        END)
        FROM sample_specific_data_values sdv
        JOIN specific_data_fields sdf ON sdf.id = sdv.field_id
        LEFT JOIN specific_data_field_options sdfo ON sdfo.id = sdv.option_id
        WHERE sdv.sample_id = s.id
      ),
      '{}'::jsonb
    )
  `);

  await knex.schema.alterTable('samples', (table) => {
    table.json('specific_data').notNullable().alter();
  });

  await knex.schema.dropTable('sample_specific_data_values');
};
