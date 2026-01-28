import { fakerFR } from '@faker-js/faker';

import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratif
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { describe, expect, test } from 'vitest';
import { sachaCommemoratifRepository } from './sachaCommemoratifRepository';

export const genCommemoratif = (
  overrides?: Partial<SachaCommemoratif>
): SachaCommemoratif => ({
  sigle: fakerFR.string.alpha(10) as CommemoratifSigle,
  libelle: fakerFR.lorem.words(3),
  typeDonnee: fakerFR.helpers.arrayElement(['V', 'N', 'D', null]),
  unite: null,
  values: [],
  ...overrides
});

export const genCommemoratifValue = (
  overrides?: Partial<SachaCommemoratif['values'][number]>
): SachaCommemoratif['values'][number] => ({
  sigle: fakerFR.string.alpha(10) as CommemoratifValueSigle,
  libelle: fakerFR.lorem.words(2),
  ...overrides
});

describe('sachaCommemoratifRepository', () => {
  test('upsertAll inserts new commemoratifs with values', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({
      values: [value1, value2]
    });

    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const result = await sachaCommemoratifRepository.findAll();
    const insertedCommemoratif = result[commemoratif.sigle];

    expect(insertedCommemoratif).toMatchObject({
      sigle: commemoratif.sigle,
      libelle: commemoratif.libelle,
      typeDonnee: commemoratif.typeDonnee
    });

    expect(Object.keys(insertedCommemoratif.values)).toHaveLength(2);
    expect(insertedCommemoratif.values[value1.sigle]).toMatchObject({
      sigle: value1.sigle,
      libelle: value1.libelle
    });
    expect(insertedCommemoratif.values[value2.sigle]).toMatchObject({
      sigle: value2.sigle,
      libelle: value2.libelle
    });
  });

  test('upsertAll updates existing commemoratifs', async () => {
    const commemoratif = genCommemoratif();

    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const updatedCommemoratif = {
      ...commemoratif,
      libelle: 'Updated libelle',
      typeDonnee: 'N' as const
    };

    await sachaCommemoratifRepository.upsertAll([updatedCommemoratif]);

    const result = await sachaCommemoratifRepository.findAll();
    const insertedCommemoratif = result[commemoratif.sigle];

    expect(insertedCommemoratif.libelle).toBe('Updated libelle');
    expect(insertedCommemoratif.typeDonnee).toBe('N');
  });

  test('upsertAll updates existing values', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });

    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const updatedValue = { ...value, libelle: 'Updated value libelle' };
    const updatedCommemoratif = { ...commemoratif, values: [updatedValue] };

    await sachaCommemoratifRepository.upsertAll([updatedCommemoratif]);

    const result = await sachaCommemoratifRepository.findAll();
    const insertedValue = result[commemoratif.sigle].values[value.sigle];

    expect(insertedValue.libelle).toBe('Updated value libelle');
  });
});
