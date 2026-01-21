import { fakerFR } from '@faker-js/faker';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratif
} from 'maestro-shared/schema/Commemoratif/CommemoratifSigle';
import { describe, expect, test } from 'vitest';
import { kysely } from './kysely';
import { sachaCommemoratifRepository } from './sachaCommemoratifRepository';

const genCommemoratif = (
  overrides?: Partial<SachaCommemoratif>
): SachaCommemoratif => ({
  cle: fakerFR.string.numeric(12),
  sigle: fakerFR.string.alpha(10) as CommemoratifSigle,
  libelle: fakerFR.lorem.words(3),
  statut: 'V',
  typeDonnee: fakerFR.helpers.arrayElement(['V', 'N', 'D', null]),
  unite: null,
  values: [],
  ...overrides
});

const genCommemoratifValue = (
  overrides?: Partial<SachaCommemoratif['values'][number]>
): SachaCommemoratif['values'][number] => ({
  cle: fakerFR.string.numeric(12),
  sigle: fakerFR.string.alpha(10) as CommemoratifValueSigle,
  libelle: fakerFR.lorem.words(2),
  statut: 'V',
  ...overrides
});

describe('sachaCommemoratifRepository', () => {
  test('upsertAll inserts new commemoratifs with values', async () => {
    const commemoratif = genCommemoratif({
      values: [genCommemoratifValue(), genCommemoratifValue()]
    });

    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const insertedCommemoratif = await kysely
      .selectFrom('sachaCommemoratifs')
      .selectAll()
      .where('sigle', '=', commemoratif.sigle)
      .executeTakeFirst();

    expect(insertedCommemoratif).toEqual({
      cle: commemoratif.cle,
      sigle: commemoratif.sigle,
      libelle: commemoratif.libelle,
      statut: commemoratif.statut,
      typeDonnee: commemoratif.typeDonnee,
      unite: commemoratif.unite
    });

    const insertedValues = await kysely
      .selectFrom('sachaCommemoratifValues')
      .selectAll()
      .where('commemoratifSigle', '=', commemoratif.sigle)
      .execute();

    expect(insertedValues).toHaveLength(2);
    expect(insertedValues).toEqual(
      expect.arrayContaining(
        commemoratif.values.map((v) => ({
          cle: v.cle,
          sigle: v.sigle,
          libelle: v.libelle,
          statut: v.statut,
          commemoratifSigle: commemoratif.sigle
        }))
      )
    );
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

    const result = await kysely
      .selectFrom('sachaCommemoratifs')
      .selectAll()
      .where('sigle', '=', commemoratif.sigle)
      .executeTakeFirst();

    expect(result?.libelle).toBe('Updated libelle');
    expect(result?.typeDonnee).toBe('N');
  });

  test('upsertAll updates existing values', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });

    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const updatedValue = { ...value, libelle: 'Updated value libelle' };
    const updatedCommemoratif = { ...commemoratif, values: [updatedValue] };

    await sachaCommemoratifRepository.upsertAll([updatedCommemoratif]);

    const result = await kysely
      .selectFrom('sachaCommemoratifValues')
      .selectAll()
      .where('sigle', '=', value.sigle)
      .executeTakeFirst();

    expect(result?.libelle).toBe('Updated value libelle');
  });
});
