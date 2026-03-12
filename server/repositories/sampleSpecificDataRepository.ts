import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';

import { kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';

const updateSampleSpecificDataAttribute = async (
  sampleSpecificDataAttribute: {
    attribute: string;
    sachaCommemoratifSigle: CommemoratifSigle | null;
    inDai: boolean;
    optional: boolean;
  },
  trx: KyselyMaestro = kysely
) => {
  await trx
    .updateTable('specificDataFields')
    .set({
      sachaCommemoratifSigle:
        sampleSpecificDataAttribute.sachaCommemoratifSigle,
      sachaInDai: sampleSpecificDataAttribute.inDai,
      sachaOptional: sampleSpecificDataAttribute.optional
    })
    .where('key', '=', sampleSpecificDataAttribute.attribute)
    .execute();
};

const updateSampleSpecificDataAttributeValue = async (
  sampleSpecificDataAttributeValue: {
    attribute: string;
    attributeValue: string;
    sachaCommemoratifValueSigle: CommemoratifValueSigle;
  },
  trx: KyselyMaestro = kysely
) => {
  const field = await trx
    .selectFrom('specificDataFields')
    .select('id')
    .where('key', '=', sampleSpecificDataAttributeValue.attribute)
    .executeTakeFirstOrThrow();

  await trx
    .updateTable('specificDataFieldOptions')
    .set({
      sachaCommemoratifValueSigle:
        sampleSpecificDataAttributeValue.sachaCommemoratifValueSigle
    })
    .where('fieldId', '=', field.id)
    .where('value', '=', sampleSpecificDataAttributeValue.attributeValue)
    .execute();
};

const deleteSampleSpecificDataAttributeValues = async (
  attribute: string,
  trx: KyselyMaestro = kysely
) => {
  const field = await trx
    .selectFrom('specificDataFields')
    .select('id')
    .where('key', '=', attribute)
    .executeTakeFirstOrThrow();

  await trx
    .updateTable('specificDataFieldOptions')
    .set({ sachaCommemoratifValueSigle: null })
    .where('fieldId', '=', field.id)
    .execute();
};

const deleteSampleSpecificDataAttributeValue = async (
  attribute: string,
  attributeValue: string,
  trx: KyselyMaestro = kysely
) => {
  const field = await trx
    .selectFrom('specificDataFields')
    .select('id')
    .where('key', '=', attribute)
    .executeTakeFirstOrThrow();

  await trx
    .updateTable('specificDataFieldOptions')
    .set({ sachaCommemoratifValueSigle: null })
    .where('fieldId', '=', field.id)
    .where('value', '=', attributeValue)
    .execute();
};

export const sampleSpecificDataRepository = {
  updateSampleSpecificDataAttribute,
  updateSampleSpecificDataAttributeValue,
  deleteSampleSpecificDataAttributeValues,
  deleteSampleSpecificDataAttributeValue
};
