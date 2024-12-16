import fp from 'lodash';
import {
  PartialSampleItem,
  SampleItemSort,
} from '../../shared/schema/Sample/SampleItem';
import { knexInstance as db} from './db';

const sampleItemsTable = 'sample_items';

export const SampleItems = (transaction = db) =>
  transaction<PartialSampleItem>(sampleItemsTable);

const findUnique = async (
  sampleId: string,
  itemNumber: number
): Promise<PartialSampleItem | undefined> => {
  console.info('Find sampleItem', sampleId, itemNumber);
  return SampleItems()
    .where({ sampleId, itemNumber })
    .first()
    .then((_) => _ && PartialSampleItem.parse(fp.omitBy(_, fp.isNil)));
};

const findMany = async (sampleId: string): Promise<PartialSampleItem[]> => {
  console.info('Find sampleItems for sample', sampleId);
  return SampleItems()
    .where({ sampleId })
    .then((sampleItems) =>
      sampleItems
        .map((_) => PartialSampleItem.parse(fp.omitBy(_, fp.isNil)))
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
  partialSampleItem: PartialSampleItem
): Promise<void> => {
  console.info('Update sampleItem', sampleId, itemNumber, partialSampleItem);
  await SampleItems().where({ sampleId, itemNumber }).update(partialSampleItem);
};

export default {
  findUnique,
  findMany,
  insertMany,
  update,
  updateMany,
};
