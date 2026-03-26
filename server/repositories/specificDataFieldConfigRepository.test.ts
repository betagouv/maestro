import type {
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  AllFieldConfigs,
  DAOABovinFieldConfigs,
  DAOAVolailleFieldConfigs,
  PPVFieldConfigs,
  SachaFieldConfigs
} from 'maestro-shared/test/specificDataFixtures';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { kysely } from './kysely';
import { specificDataFieldConfigRepository } from './specificDataFieldConfigRepository';

const sachaFieldKeys = [...new Set(SachaFieldConfigs.map((c) => c.field.key))];

const ppvOnlyKeys = PPVFieldConfigs.map((c) => c.field.key).filter(
  (key) => !sachaFieldKeys.includes(key)
);

// findSachaFields queries specificDataFieldOptions directly (not filtered by plan kind),
// so it returns ALL options for each field across all plan kinds.
const allOptionValuesByFieldKey = new Map(
  sachaFieldKeys.map((key) => [
    key,
    [
      ...new Map(
        AllFieldConfigs.filter((c) => c.field.key === key)
          .flatMap((c) => c.field.options)
          .map((o) => [o.value, o.value])
      ).values()
    ]
  ])
);

describe('findByPlanKind', () => {
  describe('PPV', () => {
    test('returns fields in order', async () => {
      const configs = await specificDataFieldConfigRepository.findByPlanKind(
        PPVValidatedProgrammingPlanFixture.id,
        'PPV'
      );

      expect(configs).toHaveLength(PPVFieldConfigs.length);
      expect(configs.map((c) => c.field.key)).toEqual(
        PPVFieldConfigs.map((c) => c.field.key)
      );
    });

    test('sets required flag correctly', async () => {
      const configs = await specificDataFieldConfigRepository.findByPlanKind(
        PPVValidatedProgrammingPlanFixture.id,
        'PPV'
      );

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      for (const fixture of PPVFieldConfigs) {
        expect(byKey[fixture.field.key].required).toBe(fixture.required);
      }
    });

    test('returns correct options per field', async () => {
      const configs = await specificDataFieldConfigRepository.findByPlanKind(
        PPVValidatedProgrammingPlanFixture.id,
        'PPV'
      );

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      for (const fixture of PPVFieldConfigs) {
        expect(
          byKey[fixture.field.key].field.options.map((o) => o.value)
        ).toEqual(fixture.field.options.map((o) => o.value));
      }
    });
  });

  describe('DAOA_VOLAILLE', () => {
    test('returns fields in order', async () => {
      const configs = await specificDataFieldConfigRepository.findByPlanKind(
        DAOAInProgressProgrammingPlanFixture.id,
        'DAOA_VOLAILLE'
      );

      expect(configs).toHaveLength(DAOAVolailleFieldConfigs.length);
      expect(configs.map((c) => c.field.key)).toEqual(
        DAOAVolailleFieldConfigs.map((c) => c.field.key)
      );
    });

    test('returns correct options per field', async () => {
      const configs = await specificDataFieldConfigRepository.findByPlanKind(
        DAOAInProgressProgrammingPlanFixture.id,
        'DAOA_VOLAILLE'
      );

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      for (const fixture of DAOAVolailleFieldConfigs) {
        expect(
          byKey[fixture.field.key].field.options.map((o) => o.value)
        ).toEqual(fixture.field.options.map((o) => o.value));
      }
    });
  });

  describe('DAOA_BOVIN', () => {
    test('returns fields in order', async () => {
      const configs = await specificDataFieldConfigRepository.findByPlanKind(
        DAOAInProgressProgrammingPlanFixture.id,
        'DAOA_BOVIN'
      );

      expect(configs).toHaveLength(DAOABovinFieldConfigs.length);
      expect(configs.map((c) => c.field.key)).toEqual(
        DAOABovinFieldConfigs.map((c) => c.field.key)
      );
    });

    test('returns correct options per field', async () => {
      const configs = await specificDataFieldConfigRepository.findByPlanKind(
        DAOAInProgressProgrammingPlanFixture.id,
        'DAOA_BOVIN'
      );

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      for (const fixture of DAOABovinFieldConfigs) {
        expect(
          byKey[fixture.field.key].field.options.map((o) => o.value)
        ).toEqual(fixture.field.options.map((o) => o.value));
      }
    });
  });
});

describe('field CRUD', () => {
  const testKey = 'testRepoFieldCRUD';

  afterAll(async () => {
    await kysely
      .deleteFrom('specificDataFields')
      .where('key', '=', testKey)
      .execute();
  });

  test('creates, queries, updates and deletes a field', async () => {
    // create
    const created = await specificDataFieldConfigRepository.createField({
      key: testKey,
      inputType: 'text',
      label: 'CRUD Test Field'
    });
    expect(created).toMatchObject({
      id: expect.any(String),
      key: testKey,
      inputType: 'text',
      label: 'CRUD Test Field',
      hintText: null,
      options: []
    });

    // query (findAllFields should include the new field)
    const all = await specificDataFieldConfigRepository.findAllFields();
    const found = all.find((f) => f.key === testKey);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);

    // update
    const updated = await specificDataFieldConfigRepository.updateField(
      created.id,
      { label: 'Updated Label', hintText: 'A hint' }
    );
    expect(updated).toMatchObject({
      id: created.id,
      key: testKey,
      label: 'Updated Label',
      hintText: 'A hint'
    });

    // delete
    await specificDataFieldConfigRepository.deleteField(created.id);
    const afterDelete = await specificDataFieldConfigRepository.findAllFields();
    expect(afterDelete.find((f) => f.key === testKey)).toBeUndefined();
  });
});

describe('field option CRUD', () => {
  const testKey = 'testRepoOptionCRUD';

  afterAll(async () => {
    await kysely
      .deleteFrom('specificDataFields')
      .where('key', '=', testKey)
      .execute();
  });

  test('creates, updates and deletes an option on a field', async () => {
    const field = await specificDataFieldConfigRepository.createField({
      key: testKey,
      inputType: 'select',
      label: 'Option CRUD Field'
    });

    // create option
    const created = await specificDataFieldConfigRepository.createFieldOption(
      field.id,
      { value: 'OPT1', label: 'Option 1', order: 1 }
    );
    expect(created).toMatchObject({
      id: expect.any(String),
      value: 'OPT1',
      label: 'Option 1',
      order: 1
    });

    // findAllFields includes option in field response
    const all = await specificDataFieldConfigRepository.findAllFields();
    const withOption = all.find((f) => f.key === testKey);
    expect(withOption!.options).toHaveLength(1);
    expect(withOption!.options[0].value).toBe('OPT1');

    // update option
    const updated = await specificDataFieldConfigRepository.updateFieldOption(
      created!.id,
      { label: 'Option 1 Updated', order: 2 }
    );
    expect(updated).toMatchObject({
      id: created!.id,
      value: 'OPT1',
      label: 'Option 1 Updated',
      order: 2
    });

    // delete option
    await specificDataFieldConfigRepository.deleteFieldOption(created!.id);
    const afterDelete = await specificDataFieldConfigRepository.findAllFields();
    const afterDeleteField = afterDelete.find((f) => f.key === testKey);
    expect(afterDeleteField!.options).toHaveLength(0);
  });
});

describe('plan kind field CRUD', () => {
  const testKey = 'testRepoPlanKindFieldCRUD';
  const programmingPlanId = DAOAInProgressProgrammingPlanFixture.id;
  const kind = 'DAOA_VOLAILLE' as const;
  let fieldId: SpecificDataFieldId;
  let optionId: SpecificDataFieldOptionId;

  beforeAll(async () => {
    const field = await kysely
      .insertInto('specificDataFields')
      .values({ key: testKey, inputType: 'select', label: 'Plan Kind CRUD' })
      .returning('id')
      .executeTakeFirstOrThrow();
    fieldId = field.id;

    const option = await kysely
      .insertInto('specificDataFieldOptions')
      .values({
        fieldKey: testKey,
        value: 'OPT1',
        label: 'Option 1',
        order: 1,
        sachaCommemoratifValueSigle: null
      })
      .returning('id')
      .executeTakeFirstOrThrow();
    optionId = option.id;
  });

  afterAll(async () => {
    await kysely
      .deleteFrom('specificDataFields')
      .where('key', '=', testKey)
      .execute();
  });

  test('adds, updates, replaces options on, and removes a plan kind field', async () => {
    // add
    const added = await specificDataFieldConfigRepository.addFieldToPlanKind(
      programmingPlanId,
      kind,
      { fieldId, required: false, order: 99 }
    );
    expect(added).toMatchObject({
      id: expect.any(String),
      programmingPlanKind: kind,
      required: false,
      order: 99,
      field: { key: testKey }
    });
    const planKindFieldId = added!.id;

    // update
    const updated = await specificDataFieldConfigRepository.updatePlanKindField(
      planKindFieldId,
      { required: true, order: 50 }
    );
    expect(updated).toMatchObject({
      id: planKindFieldId,
      programmingPlanKind: kind,
      required: true,
      order: 50
    });

    // replace options (add one)
    await specificDataFieldConfigRepository.replacePlanKindFieldOptions(
      planKindFieldId,
      [optionId]
    );
    const withOptions = await specificDataFieldConfigRepository.findByPlanKind(
      programmingPlanId,
      kind
    );
    const entry = withOptions.find((c) => c.id === planKindFieldId);
    expect(entry!.field.options).toHaveLength(1);
    expect(entry!.field.options[0].value).toBe('OPT1');

    // replace options (clear)
    await specificDataFieldConfigRepository.replacePlanKindFieldOptions(
      planKindFieldId,
      []
    );
    const cleared = await specificDataFieldConfigRepository.findByPlanKind(
      programmingPlanId,
      kind
    );
    expect(
      cleared.find((c) => c.id === planKindFieldId)!.field.options
    ).toHaveLength(0);

    // remove
    await specificDataFieldConfigRepository.removePlanKindField(
      planKindFieldId
    );
    const afterRemove = await specificDataFieldConfigRepository.findByPlanKind(
      programmingPlanId,
      kind
    );
    expect(afterRemove.find((c) => c.id === planKindFieldId)).toBeUndefined();
  });
});

describe('findSachaFields', () => {
  test('returns distinct fields from non-PPV plan kinds', async () => {
    const fields = await specificDataFieldConfigRepository.findSachaFields();

    expect(fields).toHaveLength(sachaFieldKeys.length);
  });

  test('does not include PPV-only fields', async () => {
    const fields = await specificDataFieldConfigRepository.findSachaFields();

    const keys = fields.map((f) => f.key);
    for (const key of ppvOnlyKeys) {
      expect(keys).not.toContain(key);
    }
  });

  test('includes all expected Sacha field keys', async () => {
    const fields = await specificDataFieldConfigRepository.findSachaFields();

    expect(fields.map((f) => f.key).sort()).toEqual([...sachaFieldKeys].sort());
  });

  test('returns correct options per field', async () => {
    const fields = await specificDataFieldConfigRepository.findSachaFields();

    const byKey = Object.fromEntries(fields.map((f) => [f.key, f]));
    for (const key of sachaFieldKeys) {
      const expectedValues = allOptionValuesByFieldKey.get(key) ?? [];
      expect(byKey[key].options.map((o) => o.value)).toEqual(
        expect.arrayContaining(expectedValues)
      );
      expect(byKey[key].options).toHaveLength(expectedValues.length);
    }
  });
});
