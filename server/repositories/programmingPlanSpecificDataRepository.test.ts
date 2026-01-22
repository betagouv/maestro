import { fakerFR } from '@faker-js/faker';

import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { describe, expect, test } from 'vitest';
import { programmingPlanSpecificDataRepository } from './programmingPlanSpecificDataRepository';
import { sachaCommemoratifRepository } from './sachaCommemoratifRepository';
import {
  genCommemoratif,
  genCommemoratifValue
} from './sachaCommemoratifRepository.test';

describe('programmingPlanSpecificDataRepository', () => {
  const programmingPlanKind: ProgrammingPlanKindWithSacha = 'DAOA_BREEDING';
  test('updateProgrammingPlanSpecificDataAttribute inserts new sigle mapping', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);

    await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttribute(
      {
        programmingPlanKind,
        attribute,
        sachaCommemoratifSigle: commemoratif.sigle,
        inDai: true
      }
    );

    const result = await programmingPlanSpecificDataRepository.findAll();

    expect(result[programmingPlanKind]).toBeDefined();
    expect(result[programmingPlanKind]?.attributes[attribute]).toMatchObject({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      values: {}
    });
  });

  test('updateProgrammingPlanSpecificDataAttribute updates existing sigle mapping', async () => {
    const commemoratif1 = genCommemoratif();
    const commemoratif2 = genCommemoratif();
    await sachaCommemoratifRepository.upsertAll([commemoratif1, commemoratif2]);

    const attribute = fakerFR.string.alpha(10);

    await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttribute(
      {
        programmingPlanKind,
        attribute,
        sachaCommemoratifSigle: commemoratif1.sigle,
        inDai: true
      }
    );

    await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttribute(
      {
        programmingPlanKind,
        attribute,
        sachaCommemoratifSigle: commemoratif2.sigle,
        inDai: true
      }
    );

    const result = await programmingPlanSpecificDataRepository.findAll();

    expect(result[programmingPlanKind]?.attributes[attribute]).toMatchObject({
      attribute,
      sachaCommemoratifSigle: commemoratif2.sigle
    });
  });

  test('updateProgrammingPlanSpecificDataAttributeValue inserts new value sigle mapping', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);
    const attributeValue = fakerFR.string.alpha(10);

    await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttribute(
      {
        programmingPlanKind,
        attribute,
        sachaCommemoratifSigle: commemoratif.sigle,
        inDai: true
      }
    );

    await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttributeValue(
      {
        programmingPlanKind,
        attribute,
        attributeValue,
        sachaCommemoratifValueSigle: value.sigle
      }
    );

    const result = await programmingPlanSpecificDataRepository.findAll();

    expect(
      result[programmingPlanKind]?.attributes[attribute]?.values[attributeValue]
    ).toBe(value.sigle);
  });

  test('updateProgrammingPlanSpecificDataAttributeValue updates existing value sigle mapping', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value1, value2] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);
    const attributeValue = fakerFR.string.alpha(10);

    await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttribute(
      {
        programmingPlanKind,
        attribute,
        sachaCommemoratifSigle: commemoratif.sigle,
        inDai: true
      }
    );

    await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttributeValue(
      {
        programmingPlanKind,
        attribute,
        attributeValue,
        sachaCommemoratifValueSigle: value1.sigle
      }
    );

    await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttributeValue(
      {
        programmingPlanKind,
        attribute,
        attributeValue,
        sachaCommemoratifValueSigle: value2.sigle
      }
    );

    const result = await programmingPlanSpecificDataRepository.findAll();

    expect(
      result[programmingPlanKind]?.attributes[attribute]?.values[attributeValue]
    ).toBe(value2.sigle);
  });

  test('findAll returns correct structure for all programming plan kinds', async () => {
    const result = await programmingPlanSpecificDataRepository.findAll();

    for (const kind of ProgrammingPlanKindWithSacha.options) {
      expect(result[kind]).toBeDefined();
      expect(result[kind]?.programmingPlanKind).toBe(kind);
      expect(result[kind]?.attributes).toBeDefined();
    }
  });
});
