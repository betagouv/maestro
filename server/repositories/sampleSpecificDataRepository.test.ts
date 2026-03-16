import { afterEach, describe, expect, test } from 'vitest';
import { kysely } from './kysely';
import { sachaCommemoratifRepository } from './sachaCommemoratifRepository';
import {
  genCommemoratif,
  genCommemoratifValue
} from './sachaCommemoratifRepository.test';
import { sampleSpecificDataRepository } from './sampleSpecificDataRepository';
import { specificDataFieldConfigRepository } from './specificDataFieldConfigRepository';

const FIELD_KEY = 'matrixDetails';
const FIELD_WITH_OPTIONS_KEY = 'species';
const OPTION_VALUE_1 = 'ESP7';
const OPTION_VALUE_2 = 'ESP8';

afterEach(async () => {
  await kysely
    .updateTable('specificDataFields')
    .set({ sachaCommemoratifSigle: null, sachaInDai: false })
    .where('key', 'in', [FIELD_KEY, FIELD_WITH_OPTIONS_KEY])
    .execute();

  await kysely
    .updateTable('specificDataFieldOptions')
    .set({ sachaCommemoratifValueSigle: null })
    .where('fieldKey', '=', FIELD_WITH_OPTIONS_KEY)
    .execute();
});

describe('sampleSpecificDataRepository', () => {
  test('updateSampleSpecificDataAttribute sets sigle mapping for an existing field', async () => {
    const commemoratif = genCommemoratif();
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute: FIELD_KEY,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    const field = await kysely
      .selectFrom('specificDataFields')
      .select(['key', 'sachaCommemoratifSigle'])
      .where('key', '=', FIELD_KEY)
      .executeTakeFirst();

    expect(field).toMatchObject({
      key: FIELD_KEY,
      sachaCommemoratifSigle: commemoratif.sigle
    });
  });

  test('updateSampleSpecificDataAttribute updates existing sigle mapping', async () => {
    const commemoratif1 = genCommemoratif();
    const commemoratif2 = genCommemoratif();
    await sachaCommemoratifRepository.upsertAll([commemoratif1, commemoratif2]);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute: FIELD_KEY,
      sachaCommemoratifSigle: commemoratif1.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute: FIELD_KEY,
      sachaCommemoratifSigle: commemoratif2.sigle,
      inDai: true,
      optional: false
    });

    const field = await kysely
      .selectFrom('specificDataFields')
      .select(['key', 'sachaCommemoratifSigle'])
      .where('key', '=', FIELD_KEY)
      .executeTakeFirst();

    expect(field).toMatchObject({
      key: FIELD_KEY,
      sachaCommemoratifSigle: commemoratif2.sigle
    });
  });

  test('updateSampleSpecificDataAttributeValue sets value sigle mapping', async () => {
    const value = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute: FIELD_WITH_OPTIONS_KEY,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute: FIELD_WITH_OPTIONS_KEY,
      attributeValue: OPTION_VALUE_1,
      sachaCommemoratifValueSigle: value.sigle
    });

    const result = await specificDataFieldConfigRepository.findSachaFields();
    const field = result.find((fc) => fc.key === FIELD_WITH_OPTIONS_KEY);

    expect(
      field?.options.find((o) => o.value === OPTION_VALUE_1)
        ?.sachaCommemoratifValueSigle
    ).toBe(value.sigle);
  });

  test('updateSampleSpecificDataAttributeValue updates existing value sigle mapping', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value1, value2] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute: FIELD_WITH_OPTIONS_KEY,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute: FIELD_WITH_OPTIONS_KEY,
      attributeValue: OPTION_VALUE_1,
      sachaCommemoratifValueSigle: value1.sigle
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute: FIELD_WITH_OPTIONS_KEY,
      attributeValue: OPTION_VALUE_1,
      sachaCommemoratifValueSigle: value2.sigle
    });

    const result = await specificDataFieldConfigRepository.findSachaFields();
    const field = result.find((fc) => fc.key === FIELD_WITH_OPTIONS_KEY);

    expect(
      field?.options.find((o) => o.value === OPTION_VALUE_1)
        ?.sachaCommemoratifValueSigle
    ).toBe(value2.sigle);
  });

  test('deleteSampleSpecificDataAttributeValues clears all value mappings for a field', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value1, value2] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute: FIELD_WITH_OPTIONS_KEY,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute: FIELD_WITH_OPTIONS_KEY,
      attributeValue: OPTION_VALUE_1,
      sachaCommemoratifValueSigle: value1.sigle
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute: FIELD_WITH_OPTIONS_KEY,
      attributeValue: OPTION_VALUE_2,
      sachaCommemoratifValueSigle: value2.sigle
    });

    const resultBefore =
      await specificDataFieldConfigRepository.findSachaFields();
    const fieldBefore = resultBefore.find(
      (fc) => fc.key === FIELD_WITH_OPTIONS_KEY
    );
    expect(
      fieldBefore?.options.find((o) => o.value === OPTION_VALUE_1)
        ?.sachaCommemoratifValueSigle
    ).toBe(value1.sigle);
    expect(
      fieldBefore?.options.find((o) => o.value === OPTION_VALUE_2)
        ?.sachaCommemoratifValueSigle
    ).toBe(value2.sigle);

    await sampleSpecificDataRepository.deleteSampleSpecificDataAttributeValues(
      FIELD_WITH_OPTIONS_KEY
    );

    const resultAfter =
      await specificDataFieldConfigRepository.findSachaFields();
    const fieldAfter = resultAfter.find(
      (fc) => fc.key === FIELD_WITH_OPTIONS_KEY
    );
    expect(fieldAfter).toMatchObject({
      key: FIELD_WITH_OPTIONS_KEY,
      sachaCommemoratifSigle: commemoratif.sigle
    });
    expect(
      fieldAfter?.options.every((o) => o.sachaCommemoratifValueSigle === null)
    ).toBe(true);
  });

  test('deleteSampleSpecificDataAttributeValue clears a specific value mapping', async () => {
    const value1 = genCommemoratifValue();
    const value2 = genCommemoratifValue();
    const commemoratif = genCommemoratif({ values: [value1, value2] });
    await sachaCommemoratifRepository.upsertAll([commemoratif]);

    await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
      attribute: FIELD_WITH_OPTIONS_KEY,
      sachaCommemoratifSigle: commemoratif.sigle,
      inDai: true,
      optional: false
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute: FIELD_WITH_OPTIONS_KEY,
      attributeValue: OPTION_VALUE_1,
      sachaCommemoratifValueSigle: value1.sigle
    });

    await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue({
      attribute: FIELD_WITH_OPTIONS_KEY,
      attributeValue: OPTION_VALUE_2,
      sachaCommemoratifValueSigle: value2.sigle
    });

    const resultBefore =
      await specificDataFieldConfigRepository.findSachaFields();
    const fieldBefore = resultBefore.find(
      (fc) => fc.key === FIELD_WITH_OPTIONS_KEY
    );
    expect(
      fieldBefore?.options.find((o) => o.value === OPTION_VALUE_1)
        ?.sachaCommemoratifValueSigle
    ).toBe(value1.sigle);
    expect(
      fieldBefore?.options.find((o) => o.value === OPTION_VALUE_2)
        ?.sachaCommemoratifValueSigle
    ).toBe(value2.sigle);

    await sampleSpecificDataRepository.deleteSampleSpecificDataAttributeValue(
      FIELD_WITH_OPTIONS_KEY,
      OPTION_VALUE_1
    );

    const resultAfter =
      await specificDataFieldConfigRepository.findSachaFields();
    const fieldAfter = resultAfter.find(
      (fc) => fc.key === FIELD_WITH_OPTIONS_KEY
    );
    expect(
      fieldAfter?.options.find((o) => o.value === OPTION_VALUE_1)
        ?.sachaCommemoratifValueSigle
    ).toBeNull();
    expect(
      fieldAfter?.options.find((o) => o.value === OPTION_VALUE_2)
        ?.sachaCommemoratifValueSigle
    ).toBe(value2.sigle);
  });
});
