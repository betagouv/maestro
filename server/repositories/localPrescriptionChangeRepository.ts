import type { Knex } from 'knex';
import { isNil } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import {
  LocalPrescriptionChange,
  type LocalPrescriptionChangeKind
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionChange';
import type { ProgrammingPlanEchelon } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import { z } from 'zod';
import { knexInstance as db } from './db';

const localPrescriptionChangesTable = 'local_prescription_changes';

const LocalPrescriptionChangeDbo = z.object({
  ...LocalPrescriptionChange.shape,
  department: z.union([Department, z.literal('None')]),
  companySiret: z.union([z.string(), z.literal('None')]),
  substanceKindsLaboratories: z.union([
    z.string(),
    LocalPrescriptionChange.shape.substanceKindsLaboratories
  ])
});
type LocalPrescriptionChangeDbo = z.infer<typeof LocalPrescriptionChangeDbo>;

export const LocalPrescriptionChanges = (transaction = db) =>
  transaction<LocalPrescriptionChangeDbo>(localPrescriptionChangesTable);

type LocalPrescriptionChangeInsert = Pick<
  LocalPrescriptionChange,
  | 'prescriptionId'
  | 'region'
  | 'echelon'
  | 'kind'
  | 'previousSampleCount'
  | 'changedAt'
> &
  Partial<
    Pick<
      LocalPrescriptionChange,
      | 'department'
      | 'companySiret'
      | 'sampleCount'
      | 'substanceKindsLaboratories'
    >
  >;

const formatChange = (
  change: LocalPrescriptionChangeInsert
): Omit<LocalPrescriptionChangeDbo, 'id'> => ({
  ...change,
  department: change.department ?? 'None',
  companySiret: change.companySiret ?? 'None',
  sampleCount: change.sampleCount ?? null,
  substanceKindsLaboratories: change.substanceKindsLaboratories
    ? JSON.stringify(change.substanceKindsLaboratories)
    : null,
  diffusedAt: null,
  changesViewedAt: null,
  changesViewedBy: null
});

const parseChange = (
  change: LocalPrescriptionChangeDbo
): LocalPrescriptionChange => ({
  ...change,
  department: change.department === 'None' ? undefined : change.department,
  companySiret:
    change.companySiret === 'None' ? undefined : change.companySiret,
  substanceKindsLaboratories: change.substanceKindsLaboratories
    ? typeof change.substanceKindsLaboratories === 'string'
      ? JSON.parse(change.substanceKindsLaboratories)
      : change.substanceKindsLaboratories
    : null
});

const insert = async (change: LocalPrescriptionChangeInsert) => {
  console.info('Insert local prescription change', change);
  await LocalPrescriptionChanges().insert(formatChange(change));
};

const insertMany = async (changes: LocalPrescriptionChangeInsert[]) => {
  console.info('Insert multiple local prescription changes');
  if (changes.length > 0) {
    await LocalPrescriptionChanges().insert(changes.map(formatChange));
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
    .whereNotNull('diffusedAt')
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
    .whereNotNull('diffusedAt')
    .whereNull('changesViewedAt')
    .update({ changesViewedAt: new Date(), changesViewedBy: viewedBy });
};

const findLatestPending = async (
  prescriptionIds: string[],
  echelon: ProgrammingPlanEchelon
): Promise<LocalPrescriptionChange[]> => {
  if (prescriptionIds.length === 0) {
    return [];
  }
  const rows = await LocalPrescriptionChanges()
    .distinctOn([
      'prescriptionId',
      'region',
      'department',
      'companySiret',
      'kind'
    ])
    .whereIn('prescriptionId', prescriptionIds)
    .andWhere({ echelon })
    .whereNull('diffusedAt')
    .orderBy([
      { column: 'prescriptionId' },
      { column: 'region' },
      { column: 'department' },
      { column: 'companySiret' },
      { column: 'kind' },
      { column: 'changedAt', order: 'desc' }
    ]);
  return rows.map(parseChange);
};

interface PendingScope {
  prescriptionIds?: string[];
  region?: Region;
  department?: string | null;
  companySiret?: string | null;
}

const scopedQuery = (
  transaction: Knex,
  scope: PendingScope,
  kind: LocalPrescriptionChangeKind,
  echelon: ProgrammingPlanEchelon
) => {
  const query = LocalPrescriptionChanges(transaction)
    .where({ echelon, kind })
    .whereNull('diffusedAt');
  if (scope.prescriptionIds) {
    query.whereIn('prescriptionId', scope.prescriptionIds);
  }
  if (scope.region) {
    query.andWhere({ region: scope.region });
  }
  if (!isNil(scope.department)) {
    query.andWhere({ department: scope.department });
  }
  if (!isNil(scope.companySiret)) {
    query.andWhere({ companySiret: scope.companySiret });
  }
  return query;
};

/** Marks every pending row in scope as diffused, in one batch. */
const commitPending = async (
  scope: PendingScope,
  kind: LocalPrescriptionChangeKind,
  echelon: ProgrammingPlanEchelon,
  transaction: Knex = db
): Promise<void> => {
  await scopedQuery(transaction, scope, kind, echelon).update({
    diffusedAt: new Date(),
    changesViewedAt: null,
    changesViewedBy: null
  });
};

const existsPendingForScope = async (
  scope: PendingScope,
  echelon: ProgrammingPlanEchelon
): Promise<boolean> => {
  const row = await LocalPrescriptionChanges()
    .where({ echelon })
    .modify((query) => {
      if (scope.prescriptionIds) {
        query.whereIn('prescriptionId', scope.prescriptionIds);
      }
      if (scope.region) {
        query.andWhere({ region: scope.region });
      }
      if (!isNil(scope.department)) {
        query.andWhere({ department: scope.department });
      }
      if (!isNil(scope.companySiret)) {
        query.andWhere({ companySiret: scope.companySiret });
      }
    })
    .whereNull('diffusedAt')
    .first();
  return !!row;
};

export default {
  insert,
  insertMany,
  markViewed,
  markManyViewed,
  findLatestPending,
  commitPending,
  existsPendingForScope
};
