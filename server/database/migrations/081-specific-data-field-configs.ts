import { Knex } from 'knex';

export const up = async (knex: Knex) => {
  // Table 1: field definitions
  await knex.schema.createTable('specific_data_fields', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.text('key').notNullable().unique();
    table.text('input_type').notNullable();
    table.text('label').notNullable();
    table.text('hint_text').nullable();
  });

  // Table 2: all possible options for a field
  await knex.schema.createTable('specific_data_field_options', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('field_id')
      .notNullable()
      .references('id')
      .inTable('specific_data_fields')
      .onDelete('CASCADE');
    table.text('value').notNullable();
    table.text('label').notNullable();
    table.integer('order').notNullable();
    table.unique(['field_id', 'value']);
  });

  // Table 3: which fields belong to which plan kind
  await knex.schema.createTable('programming_plan_kind_fields', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.text('programming_plan_kind').notNullable();
    table
      .uuid('field_id')
      .notNullable()
      .references('id')
      .inTable('specific_data_fields')
      .onDelete('CASCADE');
    table.boolean('required').notNullable().defaultTo(true);
    table.integer('order').notNullable();
    table.unique(['programming_plan_kind', 'field_id']);
  });

  // Table 4: which options are allowed for a field in a plan kind
  await knex.schema.createTable(
    'programming_plan_kind_field_options',
    (table) => {
      table
        .uuid('programming_plan_kind_field_id')
        .notNullable()
        .references('id')
        .inTable('programming_plan_kind_fields')
        .onDelete('CASCADE');
      table
        .uuid('specific_data_field_option_id')
        .notNullable()
        .references('id')
        .inTable('specific_data_field_options')
        .onDelete('CASCADE');
      table.primary([
        'programming_plan_kind_field_id',
        'specific_data_field_option_id'
      ]);
    }
  );

  // ── Seed data ─────────────────────────────────────────────────────────────

  // Insert fields and retrieve their ids
  const fieldRows = (await knex('specific_data_fields')
    .insert([
      {
        key: 'matrixDetails',
        input_type: 'text',
        label: 'Détail de la matrice',
        hint_text: 'Champ facultatif pour précisions supplémentaires'
      },
      {
        key: 'cultureKind',
        input_type: 'select',
        label: 'Type de culture',
        hint_text: null
      },
      {
        key: 'matrixPart',
        input_type: 'select',
        label: 'LMR / Partie du végétal concernée',
        hint_text: null
      },
      {
        key: 'releaseControl',
        input_type: 'checkbox',
        label: 'Contrôle libératoire',
        hint_text: null
      },
      {
        key: 'species',
        input_type: 'select',
        label: 'Espèce animale',
        hint_text: null
      },
      {
        key: 'killingCode',
        input_type: 'text',
        label: 'Code tuerie',
        hint_text: null
      },
      {
        key: 'sampling',
        input_type: 'select',
        label: 'Échantillonnage',
        hint_text: null
      },
      {
        key: 'animalKind',
        input_type: 'select',
        label: "Type d'animal",
        hint_text: null
      },
      {
        key: 'productionKind',
        input_type: 'select',
        label: 'Type de production',
        hint_text: null
      },
      {
        key: 'animalIdentifier',
        input_type: 'text',
        label: "Identifiant du lot ou de l'animal",
        hint_text: null
      },
      {
        key: 'breedingMethod',
        input_type: 'select',
        label: "Mode d'élevage",
        hint_text: null
      },
      {
        key: 'ageInDays',
        input_type: 'number',
        label: 'Âge (en jours)',
        hint_text: null
      },
      {
        key: 'ageInMonths',
        input_type: 'number',
        label: 'Âge (en mois)',
        hint_text: null
      },
      {
        key: 'sex',
        input_type: 'select',
        label: 'Sexe',
        hint_text: null
      },
      {
        key: 'seizure',
        input_type: 'selectWithUnknown',
        label: 'Saisie',
        hint_text: null
      },
      {
        key: 'outdoorAccess',
        input_type: 'radio',
        label: "Accès à l'extérieur des animaux de l'élevage",
        hint_text: null
      }
    ])
    .returning(['id', 'key'])) as { id: string; key: string }[];

  const fieldId = Object.fromEntries(fieldRows.map((r) => [r.key, r.id]));

  // Insert options for fields that have selectable values
  const optionRows = (await knex('specific_data_field_options')
    .insert([
      // cultureKind
      {
        field_id: fieldId.cultureKind,
        value: 'Z0211',
        label: 'Sous serre/conditions de croissance protégées',
        order: 1
      },
      {
        field_id: fieldId.cultureKind,
        value: 'PD06A',
        label: 'Production traditionnelle',
        order: 2
      },
      {
        field_id: fieldId.cultureKind,
        value: 'PD08A',
        label: 'Production industrielle intensive',
        order: 3
      },
      {
        field_id: fieldId.cultureKind,
        value: 'Z0215',
        label: 'Méthode inconnue',
        order: 4
      },
      {
        field_id: fieldId.cultureKind,
        value: 'Z0153',
        label: 'Sauvages ou cueillis',
        order: 5
      },
      {
        field_id: fieldId.cultureKind,
        value: 'PD05A',
        label: 'Production en plein air',
        order: 6
      },
      // matrixPart
      {
        field_id: fieldId.matrixPart,
        value: 'PART1',
        label: "Partie à laquelle s'applique la LMR",
        order: 1
      },
      {
        field_id: fieldId.matrixPart,
        value: 'PART2',
        label: 'Partie non LMR (préciser en commentaire)',
        order: 2
      },
      // productionKind (union of PPV and DAOA_SLAUGHTER options)
      {
        field_id: fieldId.productionKind,
        value: 'PD07A',
        label: 'Production biologique',
        order: 1
      },
      {
        field_id: fieldId.productionKind,
        value: 'PD09A',
        label: 'Production non biologique',
        order: 2
      },
      {
        field_id: fieldId.productionKind,
        value: 'Z0216',
        label: 'Autre méthode de production',
        order: 3
      },
      {
        field_id: fieldId.productionKind,
        value: 'PROD_1',
        label: 'Allaitant',
        order: 4
      },
      {
        field_id: fieldId.productionKind,
        value: 'PROD_2',
        label: 'Laitier',
        order: 5
      },
      {
        field_id: fieldId.productionKind,
        value: 'PROD_4',
        label: 'Boucherie',
        order: 6
      },
      {
        field_id: fieldId.productionKind,
        value: 'PROD_3',
        label: 'Inconnu',
        order: 7
      },
      // species (DAOA_BREEDING options)
      {
        field_id: fieldId.species,
        value: 'ESP7',
        label: 'Poulet de chair',
        order: 1
      },
      {
        field_id: fieldId.species,
        value: 'ESP8',
        label: 'Poule de réforme',
        order: 2
      },
      {
        field_id: fieldId.species,
        value: 'ESP10',
        label: 'Dinde',
        order: 3
      },
      {
        field_id: fieldId.species,
        value: 'ESP20',
        label: 'Autre volaille',
        order: 4
      },
      // animalKind (DAOA_SLAUGHTER options)
      {
        field_id: fieldId.animalKind,
        value: 'TYPEA1',
        label: 'Veau < 6 mois',
        order: 1
      },
      {
        field_id: fieldId.animalKind,
        value: 'TYPEA2',
        label: 'Jeune bovin entre 6 et 24 mois',
        order: 2
      },
      {
        field_id: fieldId.animalKind,
        value: 'TYPEA3',
        label: 'Bovin > 24 mois hors vache de réforme',
        order: 3
      },
      {
        field_id: fieldId.animalKind,
        value: 'TYPEA4',
        label: 'Vache de réforme',
        order: 4
      },
      // breedingMethod (DAOA_BREEDING options)
      {
        field_id: fieldId.breedingMethod,
        value: 'PROD_1',
        label: 'Biologique',
        order: 1
      },
      {
        field_id: fieldId.breedingMethod,
        value: 'PROD_2',
        label: 'Standard',
        order: 2
      },
      {
        field_id: fieldId.breedingMethod,
        value: 'PROD_3',
        label: "Autre signe de qualité",
        order: 3
      },
      // sex (DAOA_SLAUGHTER options)
      {
        field_id: fieldId.sex,
        value: 'SEX1',
        label: 'Mâle entier',
        order: 1
      },
      { field_id: fieldId.sex, value: 'SEX2', label: 'Mâle castré', order: 2 },
      {
        field_id: fieldId.sex,
        value: 'SEX3',
        label: 'Mâle non déterminé',
        order: 3
      },
      { field_id: fieldId.sex, value: 'SEX4', label: 'Femelle', order: 4 },
      {
        field_id: fieldId.sex,
        value: 'SEX5',
        label: 'Sexe inconnu',
        order: 5
      },
      // seizure (DAOA_SLAUGHTER options; "Unknown" stays frontend-only)
      {
        field_id: fieldId.seizure,
        value: 'EMPTY',
        label: 'Absence',
        order: 1
      },
      {
        field_id: fieldId.seizure,
        value: 'PARTIAL',
        label: 'Partielle',
        order: 2
      },
      { field_id: fieldId.seizure, value: 'TOTAL', label: 'Totale', order: 3 },
      // outdoorAccess (DAOA_BREEDING + DAOA_SLAUGHTER options)
      {
        field_id: fieldId.outdoorAccess,
        value: 'PAT1',
        label: 'Oui',
        order: 1
      },
      {
        field_id: fieldId.outdoorAccess,
        value: 'PAT0',
        label: 'Non',
        order: 2
      },
      {
        field_id: fieldId.outdoorAccess,
        value: 'PATINCO',
        label: 'Inconnu',
        order: 3
      }
    ])
    .returning(['id', 'field_id', 'value'])) as {
    id: string;
    fieldId: string;
    value: string;
  }[];

  // Build lookup: optionId[fieldKey][value] = id
  const optionId: Record<string, Record<string, string>> = {};
  for (const r of optionRows) {
    const key = fieldRows.find((f) => f.id === r.fieldId)!.key;
    if (!optionId[key]) optionId[key] = {};
    optionId[key][r.value] = r.id;
  }

  // Insert plan-kind → field associations
  const planKindFieldRows = (await knex('programming_plan_kind_fields')
    .insert([
      // PPV — order matches MatrixSpecificDataForm.ts
      {
        programming_plan_kind: 'PPV',
        field_id: fieldId.matrixDetails,
        required: false,
        order: 1
      },
      {
        programming_plan_kind: 'PPV',
        field_id: fieldId.cultureKind,
        required: false,
        order: 2
      },
      {
        programming_plan_kind: 'PPV',
        field_id: fieldId.productionKind,
        required: true,
        order: 3
      },
      {
        programming_plan_kind: 'PPV',
        field_id: fieldId.matrixPart,
        required: true,
        order: 4
      },
      {
        programming_plan_kind: 'PPV',
        field_id: fieldId.releaseControl,
        required: false,
        order: 5
      },
      // DAOA_BREEDING
      {
        programming_plan_kind: 'DAOA_BREEDING',
        field_id: fieldId.sampling,
        required: true,
        order: 1
      },
      {
        programming_plan_kind: 'DAOA_BREEDING',
        field_id: fieldId.animalIdentifier,
        required: true,
        order: 2
      },
      {
        programming_plan_kind: 'DAOA_BREEDING',
        field_id: fieldId.ageInDays,
        required: true,
        order: 3
      },
      {
        programming_plan_kind: 'DAOA_BREEDING',
        field_id: fieldId.species,
        required: true,
        order: 4
      },
      {
        programming_plan_kind: 'DAOA_BREEDING',
        field_id: fieldId.breedingMethod,
        required: true,
        order: 5
      },
      {
        programming_plan_kind: 'DAOA_BREEDING',
        field_id: fieldId.outdoorAccess,
        required: true,
        order: 6
      },
      // DAOA_SLAUGHTER
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.killingCode,
        required: true,
        order: 1
      },
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.sampling,
        required: true,
        order: 2
      },
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.animalIdentifier,
        required: true,
        order: 3
      },
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.animalKind,
        required: true,
        order: 4
      },
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.sex,
        required: true,
        order: 5
      },
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.ageInMonths,
        required: true,
        order: 6
      },
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.productionKind,
        required: true,
        order: 7
      },
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.outdoorAccess,
        required: true,
        order: 8
      },
      {
        programming_plan_kind: 'DAOA_SLAUGHTER',
        field_id: fieldId.seizure,
        required: true,
        order: 9
      }
    ])
    .returning(['id', 'programming_plan_kind', 'field_id'])) as {
    id: string;
    programmingPlanKind: string;
    fieldId: string;
  }[];

  // Build lookup: planKindFieldId[kind][fieldKey] = id
  const planKindFieldId: Record<string, Record<string, string>> = {};
  for (const r of planKindFieldRows) {
    const key = fieldRows.find((f) => f.id === r.fieldId)!.key;
    if (!planKindFieldId[r.programmingPlanKind])
      planKindFieldId[r.programmingPlanKind] = {};
    planKindFieldId[r.programmingPlanKind][key] = r.id;
  }

  // Insert plan-kind → field → option associations
  // (fields with no selectable options — text, number, checkbox, literal — get no rows here)
  await knex('programming_plan_kind_field_options').insert([
    // PPV → cultureKind (all 6 options)
    ...['Z0211', 'PD06A', 'PD08A', 'Z0215', 'Z0153', 'PD05A'].map((v) => ({
      programming_plan_kind_field_id: planKindFieldId['PPV']['cultureKind'],
      specific_data_field_option_id: optionId['cultureKind'][v]
    })),
    // PPV → productionKind (3 options: PD07A, PD09A, Z0216)
    ...['PD07A', 'PD09A', 'Z0216'].map((v) => ({
      programming_plan_kind_field_id: planKindFieldId['PPV']['productionKind'],
      specific_data_field_option_id: optionId['productionKind'][v]
    })),
    // PPV → matrixPart (both options)
    ...['PART1', 'PART2'].map((v) => ({
      programming_plan_kind_field_id: planKindFieldId['PPV']['matrixPart'],
      specific_data_field_option_id: optionId['matrixPart'][v]
    })),
    // DAOA_BREEDING → species (4 options)
    ...['ESP7', 'ESP8', 'ESP10', 'ESP20'].map((v) => ({
      programming_plan_kind_field_id:
        planKindFieldId['DAOA_BREEDING']['species'],
      specific_data_field_option_id: optionId['species'][v]
    })),
    // DAOA_BREEDING → breedingMethod (3 options)
    ...['PROD_1', 'PROD_2', 'PROD_3'].map((v) => ({
      programming_plan_kind_field_id:
        planKindFieldId['DAOA_BREEDING']['breedingMethod'],
      specific_data_field_option_id: optionId['breedingMethod'][v]
    })),
    // DAOA_BREEDING → outdoorAccess (3 options)
    ...['PAT1', 'PAT0', 'PATINCO'].map((v) => ({
      programming_plan_kind_field_id:
        planKindFieldId['DAOA_BREEDING']['outdoorAccess'],
      specific_data_field_option_id: optionId['outdoorAccess'][v]
    })),
    // DAOA_SLAUGHTER → animalKind (4 options)
    ...['TYPEA1', 'TYPEA2', 'TYPEA3', 'TYPEA4'].map((v) => ({
      programming_plan_kind_field_id:
        planKindFieldId['DAOA_SLAUGHTER']['animalKind'],
      specific_data_field_option_id: optionId['animalKind'][v]
    })),
    // DAOA_SLAUGHTER → sex (5 options)
    ...['SEX1', 'SEX2', 'SEX3', 'SEX4', 'SEX5'].map((v) => ({
      programming_plan_kind_field_id:
        planKindFieldId['DAOA_SLAUGHTER']['sex'],
      specific_data_field_option_id: optionId['sex'][v]
    })),
    // DAOA_SLAUGHTER → productionKind (4 options: PROD_1, PROD_2, PROD_4, PROD_3)
    ...['PROD_1', 'PROD_2', 'PROD_4', 'PROD_3'].map((v) => ({
      programming_plan_kind_field_id:
        planKindFieldId['DAOA_SLAUGHTER']['productionKind'],
      specific_data_field_option_id: optionId['productionKind'][v]
    })),
    // DAOA_SLAUGHTER → outdoorAccess (3 options)
    ...['PAT1', 'PAT0', 'PATINCO'].map((v) => ({
      programming_plan_kind_field_id:
        planKindFieldId['DAOA_SLAUGHTER']['outdoorAccess'],
      specific_data_field_option_id: optionId['outdoorAccess'][v]
    })),
    // DAOA_SLAUGHTER → seizure (3 options; "Unknown" handled frontend-only)
    ...['EMPTY', 'PARTIAL', 'TOTAL'].map((v) => ({
      programming_plan_kind_field_id:
        planKindFieldId['DAOA_SLAUGHTER']['seizure'],
      specific_data_field_option_id: optionId['seizure'][v]
    }))
  ]);

  // ── Phase 7: merge Sacha tables into specific_data tables ─────────────────

  // Add sacha columns to specific_data_fields
  await knex.schema.alterTable('specific_data_fields', (table) => {
    table
      .string('sacha_commemoratif_sigle')
      .nullable()
      .references('sigle')
      .inTable('sacha_commemoratifs')
      .onDelete('SET NULL');
    table.boolean('sacha_in_dai').notNullable().defaultTo(false);
    table.boolean('sacha_optional').notNullable().defaultTo(false);
  });

  // Add sacha column to specific_data_field_options
  await knex.schema.alterTable('specific_data_field_options', (table) => {
    table
      .string('sacha_commemoratif_value_sigle')
      .nullable()
      .references('sigle')
      .inTable('sacha_commemoratif_values')
      .onDelete('SET NULL');
  });

  // Migrate data: sample_specific_data_attributes → specific_data_fields
  await knex.raw(`
    UPDATE specific_data_fields sdf
    SET
      sacha_commemoratif_sigle = ssda.sacha_commemoratif_sigle,
      sacha_in_dai = ssda.in_dai,
      sacha_optional = ssda.optional
    FROM sample_specific_data_attributes ssda
    WHERE ssda.attribute = sdf.key
  `);

  // Migrate data: sample_specific_data_attribute_values → specific_data_field_options
  await knex.raw(`
    UPDATE specific_data_field_options sdfo
    SET sacha_commemoratif_value_sigle = ssdav.sacha_commemoratif_value_sigle
    FROM sample_specific_data_attribute_values ssdav
    JOIN specific_data_fields sdf ON sdf.key = ssdav.attribute
    WHERE sdfo.field_id = sdf.id
      AND sdfo.value = ssdav.attribute_value
  `);

  // Drop old Sacha tables
  await knex.schema.dropTable('sample_specific_data_attribute_values');
  await knex.schema.dropTable('sample_specific_data_attributes');
};

export const down = async (knex: Knex) => {
  // Recreate sample_specific_data_attributes (with optional column from migration 078)
  await knex.schema.createTable('sample_specific_data_attributes', (table) => {
    table.string('attribute').notNullable();
    table.string('sacha_commemoratif_sigle').nullable();
    table.boolean('in_dai').notNullable().defaultTo(false);
    table.boolean('optional').notNullable().defaultTo(false);

    table.primary(['attribute']);
    table
      .foreign('sacha_commemoratif_sigle')
      .references('sigle')
      .inTable('sacha_commemoratifs')
      .onDelete('CASCADE');
  });

  // Recreate sample_specific_data_attribute_values
  await knex.schema.createTable(
    'sample_specific_data_attribute_values',
    (table) => {
      table.string('attribute').notNullable();
      table.string('attribute_value').notNullable();
      table.string('sacha_commemoratif_value_sigle').nullable();

      table.primary(['attribute', 'attribute_value']);
      table
        .foreign(['attribute'])
        .references(['attribute'])
        .inTable('sample_specific_data_attributes')
        .onDelete('CASCADE');
      table
        .foreign('sacha_commemoratif_value_sigle')
        .references('sigle')
        .inTable('sacha_commemoratif_values')
        .onDelete('CASCADE');
    }
  );

  // Migrate data back: specific_data_fields → sample_specific_data_attributes
  await knex.raw(`
    INSERT INTO sample_specific_data_attributes (attribute, sacha_commemoratif_sigle, in_dai, optional)
    SELECT key, sacha_commemoratif_sigle, sacha_in_dai, sacha_optional
    FROM specific_data_fields
  `);

  // Migrate data back: specific_data_field_options → sample_specific_data_attribute_values
  await knex.raw(`
    INSERT INTO sample_specific_data_attribute_values (attribute, attribute_value, sacha_commemoratif_value_sigle)
    SELECT sdf.key, sdfo.value, sdfo.sacha_commemoratif_value_sigle
    FROM specific_data_field_options sdfo
    JOIN specific_data_fields sdf ON sdf.id = sdfo.field_id
    WHERE sdfo.sacha_commemoratif_value_sigle IS NOT NULL
  `);

  // Drop sacha columns from new tables
  await knex.schema.alterTable('specific_data_field_options', (table) => {
    table.dropColumn('sacha_commemoratif_value_sigle');
  });
  await knex.schema.alterTable('specific_data_fields', (table) => {
    table.dropColumn('sacha_commemoratif_sigle');
    table.dropColumn('sacha_in_dai');
    table.dropColumn('sacha_optional');
  });

  // Drop the 4 specific_data tables
  await knex.schema.dropTable('programming_plan_kind_field_options');
  await knex.schema.dropTable('programming_plan_kind_fields');
  await knex.schema.dropTable('specific_data_field_options');
  await knex.schema.dropTable('specific_data_fields');
};
