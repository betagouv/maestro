import type { Knex } from 'knex';
import type { PrescriptionChange } from 'maestro-shared/schema/Prescription/PrescriptionChange';
import { knexInstance as db } from './db';

const prescriptionChangesTable = 'prescription_changes';

type PrescriptionChangeInsert = Pick<
  PrescriptionChange,
  'prescriptionId' | 'sampleCount' | 'previousSampleCount' | 'changedAt'
>;

export const PrescriptionChanges = (transaction = db) =>
  transaction<PrescriptionChange>(prescriptionChangesTable);

const insert = async (change: PrescriptionChangeInsert) => {
  console.info('Insert prescription change', change);
  await PrescriptionChanges().insert(change);
};

const findLatestPending = async (
  prescriptionIds: string[]
): Promise<PrescriptionChange[]> => {
  if (prescriptionIds.length === 0) {
    return [];
  }
  return PrescriptionChanges()
    .distinctOn(['prescriptionId'])
    .whereIn('prescriptionId', prescriptionIds)
    .whereNull('diffusedAt')
    .orderBy([
      { column: 'prescriptionId' },
      { column: 'changedAt', order: 'desc' }
    ]);
};

const commitPending = async (
  prescriptionIds: string[],
  transaction: Knex = db
): Promise<void> => {
  if (prescriptionIds.length === 0) {
    return;
  }
  await PrescriptionChanges(transaction)
    .whereIn('prescriptionId', prescriptionIds)
    .whereNull('diffusedAt')
    .update({
      diffusedAt: new Date(),
      changesViewedAt: null,
      changesViewedBy: null
    });
};

const existsPendingForPlan = async (
  prescriptionIds: string[]
): Promise<boolean> => {
  if (prescriptionIds.length === 0) {
    return false;
  }
  const row = await PrescriptionChanges()
    .whereIn('prescriptionId', prescriptionIds)
    .whereNull('diffusedAt')
    .first();
  return !!row;
};

export default {
  insert,
  findLatestPending,
  commitPending,
  existsPendingForPlan
};
