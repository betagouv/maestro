import { isNil, sumBy } from 'lodash-es';
import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import type { DistributionKind } from '../ProgrammingPlan/DistributionKind';
import { ProgrammingPlanEchelon } from '../ProgrammingPlan/ProgrammingPlanDisplayStatus';
import type { LocalPrescription } from './LocalPrescription';
import { SubstanceKindLaboratory } from './LocalPrescriptionSubstanceKindLaboratory';

export const LocalPrescriptionChangeKind = z.enum([
  'sampleCount',
  'laboratories'
]);
export type LocalPrescriptionChangeKind = z.infer<
  typeof LocalPrescriptionChangeKind
>;

export const LocalPrescriptionChange = z.object({
  id: z.guid(),
  prescriptionId: z.guid(),
  region: Region,
  department: Department.nullish(),
  companySiret: z.string().nullish(),
  echelon: ProgrammingPlanEchelon,
  kind: LocalPrescriptionChangeKind,
  sampleCount: z.coerce.number().nullable(),
  substanceKindsLaboratories: z.array(SubstanceKindLaboratory).nullable(),
  previousSampleCount: z.coerce.number().nullable(),
  changedAt: z.coerce.date(),
  diffusedAt: z.coerce.date().nullable(),
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
