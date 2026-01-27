import { fakerFR } from '@faker-js/faker';

import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { describe, expect, test } from 'vitest';
import { sachaCommemoratifRepository } from './sachaCommemoratifRepository';
import {
  genCommemoratif,
  genCommemoratifValue
} from './sachaCommemoratifRepository.test';
import { sampleSpecificDataRepository } from './sampleSpecificDataRepository';

describe('sampleSpecificDataRepository', () => {
  test('updateSampleSpecificDataAttribute inserts new sigle mapping', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true
    });

    const result = await sampleSpecificDataRepository.findAll();

    expect(result).toBeDefined();
    expect(result[attribute]).toMatchObject({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      values: {}
    });
  });

  test('updateSampleSpecificDataAttribute updates existing sigle mapping', async () => {
    const commemoratif1 = genCommemoratif();
    const commemoratif2 = genCommemoratif();
    await sachaCommemoratifRepository.upsertAll([commemoratif1, commemoratif2]);

    const attribute = fakerFR.string.alpha(10);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif1.sigle,
      inDai: true
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif2.sigle,
      inDai: true
    });

    const result = await sampleSpecificDataRepository.findAll();

    expect(result[attribute]).toMatchObject({
      attribute,
      sachaCommemoratifSigle: commemoratif2.sigle
    });
  });

  test('updateSampleSpecificDataAttributeValue inserts new value sigle mapping', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);
    const attributeValue = fakerFR.string.alpha(10);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue,
      sachaCommemoratifValueSigle: value.sigle
    });

    const result = await sampleSpecificDataRepository.findAll();

    expect(result[attribute]?.values[attributeValue]).toBe(value.sigle);
  });

  test('updateSampleSpecificDataAttributeValue updates existing value sigle mapping', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value1, value2] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);
    const attributeValue = fakerFR.string.alpha(10);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue,
      sachaCommemoratifValueSigle: value1.sigle
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue,
      sachaCommemoratifValueSigle: value2.sigle
    });

    const result = await sampleSpecificDataRepository.findAll();

    expect(result[attribute]?.values[attributeValue]).toBe(value2.sigle);
  });

  test('findAll returns correct structure for all programming plan kinds', async () => {
    const result = await sampleSpecificDataRepository.findAll();

    for (const kind of ProgrammingPlanKindWithSacha.options) {
      expect(result[kind]).toBeDefined();
    }
  });
});
