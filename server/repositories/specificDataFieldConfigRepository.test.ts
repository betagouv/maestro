import {
  AllFieldConfigs,
  DAOABreedingFieldConfigs,
  DAOASlaughterFieldConfigs,
  PPVFieldConfigs,
  SachaFieldConfigs
} from 'maestro-shared/test/specificDataFixtures';
import { describe, expect, test } from 'vitest';
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
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('PPV');

      expect(configs).toHaveLength(PPVFieldConfigs.length);
      expect(configs.map((c) => c.field.key)).toEqual(
        PPVFieldConfigs.map((c) => c.field.key)
      );
    });

    test('sets required flag correctly', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('PPV');

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      for (const fixture of PPVFieldConfigs) {
        expect(byKey[fixture.field.key].required).toBe(fixture.required);
      }
    });

    test('returns correct options per field', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('PPV');

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      for (const fixture of PPVFieldConfigs) {
        expect(
          byKey[fixture.field.key].field.options.map((o) => o.value)
        ).toEqual(fixture.field.options.map((o) => o.value));
      }
    });
  });

  describe('DAOA_BREEDING', () => {
    test('returns fields in order', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('DAOA_BREEDING');

      expect(configs).toHaveLength(DAOABreedingFieldConfigs.length);
      expect(configs.map((c) => c.field.key)).toEqual(
        DAOABreedingFieldConfigs.map((c) => c.field.key)
      );
    });

    test('returns correct options per field', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('DAOA_BREEDING');

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      for (const fixture of DAOABreedingFieldConfigs) {
        expect(
          byKey[fixture.field.key].field.options.map((o) => o.value)
        ).toEqual(fixture.field.options.map((o) => o.value));
      }
    });
  });

  describe('DAOA_SLAUGHTER', () => {
    test('returns fields in order', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind(
          'DAOA_SLAUGHTER'
        );

      expect(configs).toHaveLength(DAOASlaughterFieldConfigs.length);
      expect(configs.map((c) => c.field.key)).toEqual(
        DAOASlaughterFieldConfigs.map((c) => c.field.key)
      );
    });

    test('returns correct options per field', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind(
          'DAOA_SLAUGHTER'
        );

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      for (const fixture of DAOASlaughterFieldConfigs) {
        expect(
          byKey[fixture.field.key].field.options.map((o) => o.value)
        ).toEqual(fixture.field.options.map((o) => o.value));
      }
    });
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
