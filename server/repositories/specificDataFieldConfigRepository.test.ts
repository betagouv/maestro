import { describe, expect, test } from 'vitest';
import { specificDataFieldConfigRepository } from './specificDataFieldConfigRepository';

describe('findByPlanKind', () => {
  describe('PPV', () => {
    test('returns 5 fields in order', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('PPV');

      expect(configs).toHaveLength(5);
      expect(configs.map((c) => c.field.key)).toEqual([
        'matrixDetails',
        'cultureKind',
        'productionKind',
        'matrixPart',
        'releaseControl'
      ]);
    });

    test('sets required flag correctly', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('PPV');

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      expect(byKey['matrixDetails'].required).toBe(false);
      expect(byKey['cultureKind'].required).toBe(false);
      expect(byKey['productionKind'].required).toBe(true);
      expect(byKey['matrixPart'].required).toBe(true);
      expect(byKey['releaseControl'].required).toBe(false);
    });

    test('cultureKind has 6 options in order', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('PPV');

      const cultureKind = configs.find((c) => c.field.key === 'cultureKind')!;
      expect(cultureKind.field.options).toHaveLength(6);
      expect(cultureKind.field.options.map((o) => o.value)).toEqual([
        'Z0211',
        'PD06A',
        'PD08A',
        'Z0215',
        'Z0153',
        'PD05A'
      ]);
    });

    test('productionKind has 3 options (PPV subset)', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('PPV');

      const productionKind = configs.find(
        (c) => c.field.key === 'productionKind'
      )!;
      expect(productionKind.field.options.map((o) => o.value)).toEqual([
        'PD07A',
        'PD09A',
        'Z0216'
      ]);
    });

    test('text and checkbox fields have no options', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('PPV');

      const byKey = Object.fromEntries(configs.map((c) => [c.field.key, c]));
      expect(byKey['matrixDetails'].field.options).toHaveLength(0);
      expect(byKey['releaseControl'].field.options).toHaveLength(0);
    });
  });

  describe('DAOA_BREEDING', () => {
    test('returns 6 fields in order', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('DAOA_BREEDING');

      expect(configs).toHaveLength(6);
      expect(configs.map((c) => c.field.key)).toEqual([
        'sampling',
        'animalIdentifier',
        'ageInDays',
        'species',
        'breedingMethod',
        'outdoorAccess'
      ]);
    });

    test('species has 4 options', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind('DAOA_BREEDING');

      const species = configs.find((c) => c.field.key === 'species')!;
      expect(species.field.options.map((o) => o.value)).toEqual([
        'ESP7',
        'ESP8',
        'ESP10',
        'ESP20'
      ]);
    });
  });

  describe('DAOA_SLAUGHTER', () => {
    test('returns 9 fields in order', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind(
          'DAOA_SLAUGHTER'
        );

      expect(configs).toHaveLength(9);
      expect(configs.map((c) => c.field.key)).toEqual([
        'killingCode',
        'sampling',
        'animalIdentifier',
        'animalKind',
        'sex',
        'ageInMonths',
        'productionKind',
        'outdoorAccess',
        'seizure'
      ]);
    });

    test('productionKind has 4 options (DAOA_SLAUGHTER subset)', async () => {
      const configs =
        await specificDataFieldConfigRepository.findByPlanKind(
          'DAOA_SLAUGHTER'
        );

      const productionKind = configs.find(
        (c) => c.field.key === 'productionKind'
      )!;
      expect(productionKind.field.options.map((o) => o.value)).toEqual([
        'PROD_1',
        'PROD_2',
        'PROD_4',
        'PROD_3'
      ]);
    });
  });
});
