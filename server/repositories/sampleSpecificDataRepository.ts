import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';

import { kysely } from './kysely';
import {
  KyselyMaestro,
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue
} from './kysely.type';

const findAll = async (
  trx: KyselyMaestro = kysely
): Promise<SampleSpecificDataRecord> => {
  const specificDataSigles = await trx
    .selectFrom('sampleSpecificDataAttribute')
    .selectAll()
    .execute();

  const valueSigles = await trx
    .selectFrom('sampleSpecificDataAttributeValue')
    .selectAll()
    .execute();

  return Object.fromEntries(
    specificDataSigles.map((c) => [
      c.attribute,
      {
        attribute: c.attribute,
        sachaCommemoratifSigle: c.sachaCommemoratifSigle,
        inDai: c.inDai,
        values: Object.fromEntries(
          valueSigles
            .filter((v) => v.attribute === c.attribute)
            .map((v) => [v.attributeValue, v.sachaCommemoratifValueSigle])
        )
      }
    ])
  ) as SampleSpecificDataRecord;
};

const updateSampleSpecificDataAttribute = async (
  sampleSpecificDataAttribute: SampleSpecificDataAttribute,
  trx: KyselyMaestro = kysely
) => {
  await trx
    .insertInto('sampleSpecificDataAttribute')
    .values(sampleSpecificDataAttribute)
    .onConflict((oc) =>
      oc.columns(['attribute']).doUpdateSet({
        sachaCommemoratifSigle:
          sampleSpecificDataAttribute.sachaCommemoratifSigle,
        inDai: sampleSpecificDataAttribute.inDai
      })
    )
    .execute();
};

const updateSampleSpecificDataAttributeValue = async (
  sampleSpecificDataAttributeValue: SampleSpecificDataAttributeValue,
  trx: KyselyMaestro = kysely
) => {
  await trx
    .insertInto('sampleSpecificDataAttributeValue')
    .values(sampleSpecificDataAttributeValue)
    .onConflict((oc) =>
      oc.columns(['attribute', 'attributeValue']).doUpdateSet({
        sachaCommemoratifValueSigle:
          sampleSpecificDataAttributeValue.sachaCommemoratifValueSigle
      })
    )
    .execute();
};

const deleteSampleSpecificDataAttributeValues = async (
  attribute: string,
  trx: KyselyMaestro = kysely
) => {
  await trx
    .deleteFrom('sampleSpecificDataAttributeValue')
    .where('attribute', '=', attribute)
    .execute();
};

const deleteSampleSpecificDataAttributeValue = async (
  attribute: string,
  attributeValue: string,
  trx: KyselyMaestro = kysely
) => {
  await trx
    .deleteFrom('sampleSpecificDataAttributeValue')
    .where('attribute', '=', attribute)
    .where('attributeValue', '=', attributeValue)
    .execute();
};

export const sampleSpecificDataRepository = {
  findAll,
  updateSampleSpecificDataAttribute,
  updateSampleSpecificDataAttributeValue,
  deleteSampleSpecificDataAttributeValues,
  deleteSampleSpecificDataAttributeValue
};
