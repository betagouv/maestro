import { isNil, omitBy } from 'lodash-es';
import {
  PartialSampleItem,
  SampleItemSort
} from 'maestro-shared/schema/Sample/SampleItem';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';

const sampleItemsTable = 'sample_items';

export const SampleItems = (transaction = db) =>
  transaction<PartialSampleItem>(sampleItemsTable);

const findUnique = async (
  sampleId: string,
  itemNumber: number,
  copyNumber: number
): Promise<PartialSampleItem | undefined> => {
  console.info('Find sampleItem', sampleId, itemNumber, copyNumber);
  return SampleItems()
    .where({ sampleId, itemNumber, copyNumber })
    .first()
    .then((_) => _ && PartialSampleItem.parse(omitBy(_, isNil)));
};

const findMany = async (sampleId: string): Promise<PartialSampleItem[]> => {
  console.info('Find sampleItems for sample', sampleId);
  return SampleItems()
    .where({ sampleId })
    .then((sampleItems) =>
      sampleItems
        .map((_) => PartialSampleItem.parse(omitBy(_, isNil)))
        .sort(SampleItemSort)
    );
};

const insertMany = async (
  partialSampleItems: PartialSampleItem[]
): Promise<void> => {
  if (partialSampleItems.length > 0) {
    console.info('Insert sampleItems', partialSampleItems);
    await SampleItems().insert(partialSampleItems);
  }
};

const updateMany = async (
  sampleId: string,
  partialSampleItems: PartialSampleItem[]
): Promise<void> => {
  console.info('Update sampleItems for sample', sampleId);
  await db.transaction(async (transaction) => {
    await SampleItems(transaction).where({ sampleId }).forUpdate();
    await SampleItems(transaction).where({ sampleId }).delete();
    if (partialSampleItems.length > 0) {
      await SampleItems(transaction).insert(partialSampleItems);
    }
  });
};

const update = async (
  sampleId: string,
  itemNumber: number,
  copyNumber: number,
  partialSampleItem: PartialSampleItem,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  console.info('Update sampleItem', sampleId, copyNumber, partialSampleItem);
  await trx
    .updateTable('sampleItems')
    .where('sampleId', '=', sampleId)
    .where('itemNumber', '=', itemNumber)
    .where('copyNumber', '=', copyNumber)
    .set(partialSampleItem)
    .execute();
};

export default {
  findUnique,
  findMany,
  insertMany,
  update,
  updateMany
};
