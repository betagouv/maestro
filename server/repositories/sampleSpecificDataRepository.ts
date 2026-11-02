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
  },
  trx: KyselyMaestro = kysely
) => {
  await trx
    .updateTable('specificDataFields')
    .set({
      sachaCommemoratifSigle: sampleSpecificDataAttribute.sachaCommemoratifSigle
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

export const sampleSpecificDataRepository = {
  updateSampleSpecificDataAttribute,
  updateSampleSpecificDataAttributeValue
};
