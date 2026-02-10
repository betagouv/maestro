import { fakerFR } from '@faker-js/faker';

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
      inDai: true,
      optional: false
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
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif2.sigle,
      inDai: true,
      optional: false
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
      inDai: true,
      optional: false
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
      inDai: true,
      optional: false
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

  test('deleteSampleSpecificDataAttributeValues deletes all values for an attribute', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value1, value2] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);
    const attributeValue1 = fakerFR.string.alpha(10);
    const attributeValue2 = fakerFR.string.alpha(10);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue: attributeValue1,
      sachaCommemoratifValueSigle: value1.sigle
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue: attributeValue2,
      sachaCommemoratifValueSigle: value2.sigle
    });

    const resultBefore = await sampleSpecificDataRepository.findAll();
    expect(resultBefore[attribute]?.values[attributeValue1]).toBe(value1.sigle);
    expect(resultBefore[attribute]?.values[attributeValue2]).toBe(value2.sigle);

    await sampleSpecificDataRepository.deleteSampleSpecificDataAttributeValues(
      attribute
    );

    const resultAfter = await sampleSpecificDataRepository.findAll();
    expect(resultAfter[attribute]).toMatchObject({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      values: {}
    });
  });

  test('deleteSampleSpecificDataAttributeValue deletes a specific attribute value', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value1, value2] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    const attribute = fakerFR.string.alpha(10);
    const attributeValue1 = fakerFR.string.alpha(10);
    const attributeValue2 = fakerFR.string.alpha(10);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue: attributeValue1,
      sachaCommemoratifValueSigle: value1.sigle
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute,
      attributeValue: attributeValue2,
      sachaCommemoratifValueSigle: value2.sigle
    });

    const resultBefore = await sampleSpecificDataRepository.findAll();
    expect(resultBefore[attribute]?.values[attributeValue1]).toBe(value1.sigle);
    expect(resultBefore[attribute]?.values[attributeValue2]).toBe(value2.sigle);

    await sampleSpecificDataRepository.deleteSampleSpecificDataAttributeValue(
      attribute,
      attributeValue1
    );

    const resultAfter = await sampleSpecificDataRepository.findAll();
    expect(resultAfter[attribute]?.values[attributeValue1]).toBeUndefined();
    expect(resultAfter[attribute]?.values[attributeValue2]).toBe(value2.sigle);
  });
});
