import type { ContextSigleImport } from './contextSigleImport';
import type { DescriptorImport } from './descriptorImport';

const data = (name: string, value: unknown) =>
  `const ${name} = ${JSON.stringify(value, null, 2)};\n`;

export const renderDescriptorMigration = (
  descriptorImport: DescriptorImport,
  contextSigleImport: ContextSigleImport,
  year: number
): string =>
  [
    "import type { Knex } from 'knex';\n",
    `const year = ${year};\n`,
    data('fields', descriptorImport.fields),
    data('options', descriptorImport.options),
    data('planFields', descriptorImport.planFields),
    data('subPlanFields', descriptorImport.subPlanFields),
    data('subPlanFieldReplacements', descriptorImport.subPlanFieldReplacements),
    data('sachaContextSigles', contextSigleImport.updates),
    migrationLogic
  ].join('\n');

const migrationLogic = `const newFieldKeys = fields.map(({ key }) => key);

const placedFieldKeys = [
  ...new Set(
    [...planFields, ...subPlanFields].flatMap((placement) =>
      placement.fields.map(({ fieldKey }) => fieldKey)
    )
  )
];

const placedSubPlanNumbers = [
  ...planFields.map(({ subPlanNumber }) => subPlanNumber),
  ...subPlanFields.flatMap(({ subPlanNumbers }) => subPlanNumbers)
];

const insertedIds = (result: { rows: { id: string }[] }) =>
  result.rows.map(({ id }) => id);

const replaceSubPlanFieldSettings = async (
  knex: Knex,
  from: 'previous' | 'next',
  to: 'previous' | 'next'
) => {
  for (const replacement of subPlanFieldReplacements) {
    const current = replacement[from];
    const target = replacement[to];
    const [subPlanFieldId] = insertedIds(
      await knex.raw(
        \`SELECT spf.id
         FROM programming_sub_plan_fields_raw spf
         JOIN programming_sub_plans_raw sp ON sp.id = spf.programming_sub_plan_id
         JOIN programming_plans p ON p.id = sp.programming_plan_id
         JOIN specific_data_fields f ON f.id = spf.field_id
         WHERE p.year = ? AND sp.sub_plan_number = ? AND f.key = ?
           AND spf.inheritance = 'Own' AND spf.required = ?
           AND (
             SELECT array_agg(o.value ORDER BY o.value)
             FROM programming_sub_plan_field_options spfo
             JOIN specific_data_field_options o ON o.id = spfo.specific_data_field_option_id
             WHERE spfo.programming_sub_plan_field_id = spf.id
           ) IS NOT DISTINCT FROM (
             SELECT array_agg(v ORDER BY v) FROM unnest(?::text[]) AS v
           )\`,
        [
          year,
          replacement.subPlanNumber,
          replacement.fieldKey,
          current.required,
          current.optionValues
        ]
      )
    );
    if (!subPlanFieldId) {
      continue;
    }

    await knex('programming_sub_plan_fields_raw')
      .where({ id: subPlanFieldId })
      .update({ required: target.required });
    await knex('programming_sub_plan_field_options')
      .where({ programming_sub_plan_field_id: subPlanFieldId })
      .delete();
    await knex.raw(
      \`INSERT INTO programming_sub_plan_field_options (programming_sub_plan_field_id, specific_data_field_option_id)
       SELECT ?, o.id FROM specific_data_field_options o
       WHERE o.field_key = ? AND o.value = ANY(?)\`,
      [subPlanFieldId, replacement.fieldKey, target.optionValues]
    );
  }
};

export const up = async (knex: Knex) => {
  await knex.raw(
    \`UPDATE programming_sub_plans_raw sp
     SET sacha_context_sigle = u.sacha_context_sigle
     FROM programming_plans p, unnest(?::text[], ?::text[]) AS u(sub_plan_number, sacha_context_sigle)
     WHERE p.id = sp.programming_plan_id
       AND p.year = ?
       AND sp.sub_plan_number = u.sub_plan_number
       AND sp.sacha_context_sigle IS NULL\`,
    [
      sachaContextSigles.map(({ subPlanNumber }) => subPlanNumber),
      sachaContextSigles.map(({ sachaContextSigle }) => sachaContextSigle),
      year
    ]
  );

  const sachaSigles = new Set(
    (await knex('sacha_commemoratifs').select('sigle')).map(({ sigle }) => sigle)
  );
  const sachaValueSigles = new Set(
    (await knex('sacha_commemoratif_values').select('sigle')).map(
      ({ sigle }) => sigle
    )
  );

  if (fields.length > 0) {
    await knex('specific_data_fields')
      .insert(
        fields.map((field) => {
          const hasSachaSigle =
            field.sachaCommemoratifSigle !== null &&
            sachaSigles.has(field.sachaCommemoratifSigle);
          return {
            key: field.key,
            input_type: field.inputType,
            label: field.label,
            hint_text: null,
            sacha_commemoratif_sigle: hasSachaSigle
              ? field.sachaCommemoratifSigle
              : null,
            sacha_in_dai: field.sachaInDai && hasSachaSigle
          };
        })
      )
      .onConflict('key')
      .ignore();
  }

  if (options.length > 0) {
    await knex('specific_data_field_options')
      .insert(
        options.map((option) => ({
          field_key: option.fieldKey,
          value: option.value,
          label: option.label,
          order: option.order,
          sacha_commemoratif_value_sigle:
            option.sachaCommemoratifValueSigle !== null &&
            sachaValueSigles.has(option.sachaCommemoratifValueSigle)
              ? option.sachaCommemoratifValueSigle
              : null
        }))
      )
      .onConflict(['field_key', 'value'])
      .ignore();
  }

  for (const placement of planFields) {
    const plan = await knex.raw(
      \`SELECT sp.programming_plan_id AS id
       FROM programming_sub_plans_raw sp
       JOIN programming_plans p ON p.id = sp.programming_plan_id
       WHERE p.year = ? AND sp.sub_plan_number = ?\`,
      [year, placement.subPlanNumber]
    );
    const [planId] = insertedIds(plan);
    if (!planId) {
      continue;
    }

    for (const field of placement.fields) {
      const [planFieldId] = insertedIds(
        await knex.raw(
          \`INSERT INTO programming_plan_fields (programming_plan_id, field_id, required, "order")
           SELECT ?, f.id, ?, ? FROM specific_data_fields f WHERE f.key = ?
           ON CONFLICT (programming_plan_id, field_id) DO NOTHING
           RETURNING id\`,
          [planId, field.required, field.order, field.fieldKey]
        )
      );
      if (!planFieldId) {
        continue;
      }

      await knex.raw(
        \`INSERT INTO programming_plan_field_options (programming_plan_field_id, specific_data_field_option_id)
         SELECT ?, o.id FROM specific_data_field_options o
         WHERE o.field_key = ? AND o.value = ANY(?)
         ON CONFLICT DO NOTHING\`,
        [planFieldId, field.fieldKey, field.optionValues]
      );

      await knex.raw(
        \`INSERT INTO programming_sub_plan_fields_raw (programming_sub_plan_id, field_id, required, "order", inheritance)
         SELECT sp.id, f.id, ?, ?, 'Inherited'
         FROM programming_sub_plans_raw sp
         JOIN specific_data_fields f ON f.key = ?
         WHERE sp.programming_plan_id = ?
         ON CONFLICT (programming_sub_plan_id, field_id) DO NOTHING\`,
        [field.required, field.order, field.fieldKey, planId]
      );
    }
  }

  for (const placement of subPlanFields) {
    for (const field of placement.fields) {
      const subPlanFieldIds = insertedIds(
        await knex.raw(
          \`INSERT INTO programming_sub_plan_fields_raw (programming_sub_plan_id, field_id, required, "order", inheritance)
           SELECT sp.id, f.id, ?,
             COALESCE((SELECT max(x."order") FROM programming_sub_plan_fields_raw x WHERE x.programming_sub_plan_id = sp.id), 0) + 1,
             'Own'
           FROM programming_sub_plans_raw sp
           JOIN programming_plans p ON p.id = sp.programming_plan_id
           JOIN specific_data_fields f ON f.key = ?
           WHERE p.year = ? AND sp.sub_plan_number = ANY(?)
           ON CONFLICT (programming_sub_plan_id, field_id) DO NOTHING
           RETURNING id\`,
          [field.required, field.fieldKey, year, placement.subPlanNumbers]
        )
      );
      if (subPlanFieldIds.length === 0 || field.optionValues.length === 0) {
        continue;
      }

      await knex.raw(
        \`INSERT INTO programming_sub_plan_field_options (programming_sub_plan_field_id, specific_data_field_option_id)
         SELECT spf.id, o.id
         FROM unnest(?::uuid[]) AS spf(id)
         CROSS JOIN specific_data_field_options o
         WHERE o.field_key = ? AND o.value = ANY(?)
         ON CONFLICT DO NOTHING\`,
        [subPlanFieldIds, field.fieldKey, field.optionValues]
      );
    }
  }

  await replaceSubPlanFieldSettings(knex, 'previous', 'next');
};

export const down = async (knex: Knex) => {
  await knex.raw(
    \`UPDATE programming_sub_plans_raw sp
     SET sacha_context_sigle = NULL
     FROM programming_plans p, unnest(?::text[], ?::text[]) AS u(sub_plan_number, sacha_context_sigle)
     WHERE p.id = sp.programming_plan_id
       AND p.year = ?
       AND sp.sub_plan_number = u.sub_plan_number
       AND sp.sacha_context_sigle = u.sacha_context_sigle\`,
    [
      sachaContextSigles.map(({ subPlanNumber }) => subPlanNumber),
      sachaContextSigles.map(({ sachaContextSigle }) => sachaContextSigle),
      year
    ]
  );

  await replaceSubPlanFieldSettings(knex, 'next', 'previous');

  const placedPlanIds = knex('programming_sub_plans_raw as sp')
    .join('programming_plans as p', 'p.id', 'sp.programming_plan_id')
    .where('p.year', year)
    .whereIn('sp.sub_plan_number', placedSubPlanNumbers)
    .select('sp.programming_plan_id');
  const placedFieldIds = knex('specific_data_fields')
    .whereIn('key', placedFieldKeys)
    .select('id');

  await knex('programming_sub_plan_fields_raw')
    .whereIn('field_id', placedFieldIds)
    .whereIn(
      'programming_sub_plan_id',
      knex('programming_sub_plans_raw')
        .whereIn('programming_plan_id', placedPlanIds)
        .select('id')
    )
    .delete();

  await knex('programming_plan_fields')
    .whereIn('field_id', placedFieldIds)
    .whereIn('programming_plan_id', placedPlanIds)
    .delete();

  await knex('specific_data_fields').whereIn('key', newFieldKeys).delete();

  for (const option of options.filter(
    ({ fieldKey }) => !newFieldKeys.includes(fieldKey)
  )) {
    await knex('specific_data_field_options')
      .where({ field_key: option.fieldKey, value: option.value })
      .delete();
  }
};
`;
