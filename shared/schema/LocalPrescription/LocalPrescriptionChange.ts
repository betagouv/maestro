import { isNil, sumBy } from 'lodash-es';
import { z } from 'zod';
import { Region } from '../../referential/Region';
import type { DistributionKind } from '../ProgrammingPlan/DistributionKind';
import type { LocalPrescription } from './LocalPrescription';

// One row per sampleCount change on a region-level LocalPrescription row —
// append-only history, never overwritten. "Currently pending" state is
// computed by joining the oldest row with changesViewedAt still null (see
// localPrescriptionRepository.ts) rather than mutating a single row here.
export const LocalPrescriptionChange = z.object({
  id: z.guid(),
  prescriptionId: z.guid(),
  region: Region,
  previousSampleCount: z.coerce.number().nullable(),
  changedAt: z.coerce.date(),
  changesViewedAt: z.coerce.date().nullable(),
  changesViewedBy: z.guid().nullable()
});
export type LocalPrescriptionChange = z.infer<typeof LocalPrescriptionChange>;

export const hasUnviewedChange = (
  changedAt: Date | null | undefined
): boolean => changedAt != null;

// Same "empty ⇒ incomplete, any missing laboratoryId ⇒ incomplete" rule as
// the existing missingLaboratory prescription filter in
// ProgrammingPrescriptionList.tsx — kept here as a named, testable primitive.
export const isLaboratoryAssignmentComplete = (
  substanceKindsLaboratories: LocalPrescription['substanceKindsLaboratories']
): boolean =>
  (substanceKindsLaboratories?.length ?? 0) > 0 &&
  !substanceKindsLaboratories!.some((s) => isNil(s.laboratoryId));

// Whether a flagged region row still has real unfinished business, i.e.
// whether it's eligible for the "leave the page" dismissal (case B) or must
// stay flagged until an explicit corrective action clears it server-side
// (case A). Evaluated on CURRENT state — e.g. a lab assigned *before* a
// later volume change still counts as "already fine" here, even though it
// didn't itself trigger the clear.
export const regionRowNeedsChangeAction = (
  distributionKind: DistributionKind,
  ownRegionalPrescription: Pick<
    LocalPrescription,
    'sampleCount' | 'substanceKindsLaboratories'
  >,
  subLocalPrescriptions: Pick<
    LocalPrescription,
    'sampleCount' | 'substanceKindsLaboratories'
  >[]
): boolean => {
  if (distributionKind === 'REGIONAL') {
    return !isLaboratoryAssignmentComplete(
      ownRegionalPrescription.substanceKindsLaboratories
    );
  }
  const distributedCount = sumBy(subLocalPrescriptions, 'sampleCount');
  const isFullyDistributed =
    distributedCount === ownRegionalPrescription.sampleCount;
  const hasAnyDepartmentLaboratory = subLocalPrescriptions.some((sub) =>
    isLaboratoryAssignmentComplete(sub.substanceKindsLaboratories)
  );
  return !(isFullyDistributed || hasAnyDepartmentLaboratory);
};
