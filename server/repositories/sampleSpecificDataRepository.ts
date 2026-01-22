import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';

import { kysely } from './kysely';
import {
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue
} from './kysely.type';

const findAll = async (): Promise<SampleSpecificDataRecord> => {
  const specificDataSigles = await kysely
    .selectFrom('sampleSpecificDataAttribute')
    .selectAll()
    .execute();

  const valueSigles = await kysely
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
  sampleSpecificDataAttribute: SampleSpecificDataAttribute
) => {
  await kysely
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
  sampleSpecificDataAttributeValue: SampleSpecificDataAttributeValue
) => {
  await kysely
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

export const sampleSpecificDataRepository = {
  findAll,
  updateSampleSpecificDataAttribute,
  updateSampleSpecificDataAttributeValue
};
