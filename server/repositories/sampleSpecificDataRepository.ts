import type {
  CommemoratifSigle,
  CommemoratifValueSigle
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';

import { kysely } from './kysely';
import type { KyselyMaestro } from './kysely.type';

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
    sachaCommemoratifValueSigle: CommemoratifValueSigle | null;
  },
  trx: KyselyMaestro = kysely
) => {
  await trx
    .updateTable('specificDataFieldOptions')
    .set({
      sachaCommemoratifValueSigle:
        sampleSpecificDataAttributeValue.sachaCommemoratifValueSigle
    })
    .where('fieldKey', '=', sampleSpecificDataAttributeValue.attribute)
    .where('value', '=', sampleSpecificDataAttributeValue.attributeValue)
    .execute();
};

const deleteSampleSpecificDataAttributeValues = async (
  attribute: string,
  trx: KyselyMaestro = kysely
) => {
  await trx
    .updateTable('specificDataFieldOptions')
    .set({ sachaCommemoratifValueSigle: null })
    .where('fieldKey', '=', attribute)
    .execute();
};

const deleteSampleSpecificDataAttributeValue = async (
  attribute: string,
  attributeValue: string,
  trx: KyselyMaestro = kysely
) => {
  await trx
    .updateTable('specificDataFieldOptions')
    .set({ sachaCommemoratifValueSigle: null })
    .where('fieldKey', '=', attribute)
    .where('value', '=', attributeValue)
    .execute();
};

export const sampleSpecificDataRepository = {
  updateSampleSpecificDataAttribute,
  updateSampleSpecificDataAttributeValue,
  deleteSampleSpecificDataAttributeValues,
  deleteSampleSpecificDataAttributeValue
};
