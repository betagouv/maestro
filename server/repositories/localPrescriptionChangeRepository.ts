import type { Region } from 'maestro-shared/referential/Region';
import type { LocalPrescriptionChange } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionChange';
import { knexInstance as db } from './db';

const localPrescriptionChangesTable = 'local_prescription_changes';

type LocalPrescriptionChangeInsert = Pick<
  LocalPrescriptionChange,
  'prescriptionId' | 'region' | 'previousSampleCount' | 'changedAt'
>;

export const LocalPrescriptionChanges = (transaction = db) =>
  transaction<LocalPrescriptionChange>(localPrescriptionChangesTable);

const insert = async (change: LocalPrescriptionChangeInsert) => {
  console.info('Insert local prescription change', change);
  await LocalPrescriptionChanges().insert(change);
};

const insertMany = async (changes: LocalPrescriptionChangeInsert[]) => {
  console.info('Insert multiple local prescription changes');
  if (changes.length > 0) {
    await LocalPrescriptionChanges().insert(changes);
  }
};

const markViewed = async ({
  prescriptionId,
  region,
  viewedBy
}: {
  prescriptionId: string;
  region: Region;
  viewedBy: string;
}) => {
  await LocalPrescriptionChanges()
    .where({ prescriptionId, region })
    .whereNull('changesViewedAt')
    .update({ changesViewedAt: new Date(), changesViewedBy: viewedBy });
};

const markManyViewed = async ({
  region,
  prescriptionIds,
  viewedBy
}: {
  region: Region;
  prescriptionIds: string[];
  viewedBy: string;
}) => {
  if (prescriptionIds.length === 0) {
    return;
  }
  await LocalPrescriptionChanges()
    .where({ region })
    .whereIn('prescriptionId', prescriptionIds)
    .whereNull('changesViewedAt')
    .update({ changesViewedAt: new Date(), changesViewedBy: viewedBy });
};

export default {
  insert,
  insertMany,
  markViewed,
  markManyViewed
};
