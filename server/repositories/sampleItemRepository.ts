import { isNil, omitBy } from 'lodash-es';
import {
  PartialSampleItem,
  SampleItemSort
} from 'maestro-shared/schema/Sample/SampleItem';
import { z } from 'zod';
import { analysisTable } from './analysisRepository';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';

const sampleItemsTable = 'sample_items';

const PartialSampleItemDbo = PartialSampleItem.omit({
  analysis: true
});
const PartialSampleItemJoinedDbo = z.object({
  ...PartialSampleItemDbo.shape,
  analysisStatus: z.string().nullish(),
  analysisCompliance: z.boolean().nullish(),
  analysisNotesOnCompliance: z.string().nullish()
});

type PartialSampleItemDbo = z.infer<typeof PartialSampleItemDbo>;
type PartialSampleItemJoinedDbo = z.infer<typeof PartialSampleItemJoinedDbo>;

export const SampleItems = (transaction = db) =>
  transaction<PartialSampleItemDbo>(sampleItemsTable);

const findUnique = async (
  sampleId: string,
  itemNumber: number,
  copyNumber: number
): Promise<PartialSampleItem | undefined> => {
  console.info('Find sampleItem', sampleId, itemNumber, copyNumber);
  return SampleItems()
    .select(
      `${sampleItemsTable}.*`,
      `${analysisTable}.status as analysisStatus`,
      `${analysisTable}.compliance as analysisCompliance`,
      `${analysisTable}.notesOnCompliance as analysisNotesOnCompliance`
    )
    .where(`${sampleItemsTable}.sampleId`, sampleId)
    .where(`${sampleItemsTable}.itemNumber`, itemNumber)
    .where(`${sampleItemsTable}.copyNumber`, copyNumber)
    .leftJoin(analysisTable, (query) =>
      query
        .on(`${analysisTable}.sample_id`, `${sampleItemsTable}.sampleId`)
        .andOn(`${analysisTable}.item_number`, `${sampleItemsTable}.itemNumber`)
        .andOn(`${analysisTable}.copy_number`, `${sampleItemsTable}.copyNumber`)
    )
    .first()
    .then((_) => parseSampleItem(_));
};

const findMany = async (sampleId: string): Promise<PartialSampleItem[]> => {
  console.info('Find sampleItems for sample', sampleId);
  return SampleItems()
    .select(
      `${sampleItemsTable}.*`,
      `${analysisTable}.status as analysisStatus`,
      `${analysisTable}.compliance as analysisCompliance`,
      `${analysisTable}.notesOnCompliance as analysisNotesOnCompliance`
    )
    .where(`${sampleItemsTable}.sampleId`, sampleId)
    .leftJoin(analysisTable, (query) =>
      query
        .on(`${analysisTable}.sample_id`, `${sampleItemsTable}.sampleId`)
        .andOn(`${analysisTable}.item_number`, `${sampleItemsTable}.itemNumber`)
        .andOn(`${analysisTable}.copy_number`, `${sampleItemsTable}.copyNumber`)
    )
    .then((sampleItems) =>
      sampleItems.map(parseSampleItem).sort(SampleItemSort)
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

    const existingItems = await SampleItems(transaction)
      .where({ sampleId })
      .select('itemNumber', 'copyNumber');

    const existingKeys = new Set(
      existingItems.map((item) => `${item.itemNumber}-${item.copyNumber}`)
    );

    const newKeys = new Set(
      partialSampleItems.map((item) => `${item.itemNumber}-${item.copyNumber}`)
    );

    const itemsToDelete = existingItems.filter(
      (item) => !newKeys.has(`${item.itemNumber}-${item.copyNumber}`)
    );

    if (itemsToDelete.length > 0) {
      await Promise.all(
        itemsToDelete.map((item) =>
          SampleItems(transaction)
            .where({
              sampleId,
              itemNumber: item.itemNumber,
              copyNumber: item.copyNumber
            })
            .delete()
        )
      );
    }

    await Promise.all(
      partialSampleItems.map((item) => {
        const key = `${item.itemNumber}-${item.copyNumber}`;
        if (existingKeys.has(key)) {
          return SampleItems(transaction)
            .where({
              sampleId,
              itemNumber: item.itemNumber,
              copyNumber: item.copyNumber
            })
            .update(item);
        } else {
          return SampleItems(transaction).insert(item);
        }
      })
    );
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
    .set(PartialSampleItemDbo.parse(partialSampleItem))
    .execute();
};

const parseSampleItem = (data: PartialSampleItemJoinedDbo) =>
  data &&
  PartialSampleItem.parse({
    ...omitBy(data, isNil),
    analysis: data.analysisStatus && {
      status: data.analysisStatus,
      compliance: data.analysisCompliance,
      notesOnCompliance: data.analysisNotesOnCompliance
    }
  });

export default {
  findUnique,
  findMany,
  insertMany,
  update,
  updateMany
};
