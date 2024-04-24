import fp from 'lodash';
import {
  PartialSampleItem,
  SampleItem,
} from '../../shared/schema/Sample/SampleItem';
import db from './db';

const sampleItemsTable = 'sample_items';

export const SampleItems = () => db<SampleItem>(sampleItemsTable);

const findMany = async (sampleId: string): Promise<SampleItem[]> => {
  console.info('Find sampleItems for sample', sampleId);
  return SampleItems()
    .where({ sampleId })
    .then((sampleItems) =>
      sampleItems.map((_) => SampleItem.parse(fp.omitBy(_, fp.isNil)))
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

const deleteMany = async (sampleId: string): Promise<void> => {
  console.info('Delete sampleItems for sample', sampleId);
  await SampleItems().where({ sampleId }).delete();
};

export default {
  findMany,
  insertMany,
  deleteMany,
};
