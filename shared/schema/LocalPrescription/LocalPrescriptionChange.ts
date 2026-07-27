import { isNil, sumBy } from 'lodash-es';
import { z } from 'zod';
import { Region } from '../../referential/Region';
import type { DistributionKind } from '../ProgrammingPlan/DistributionKind';
import type { LocalPrescription } from './LocalPrescription';

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

export const isLaboratoryAssignmentComplete = (
  substanceKindsLaboratories: LocalPrescription['substanceKindsLaboratories']
): boolean =>
  (substanceKindsLaboratories?.length ?? 0) > 0 &&
  !substanceKindsLaboratories!.some((s) => isNil(s.laboratoryId));

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
