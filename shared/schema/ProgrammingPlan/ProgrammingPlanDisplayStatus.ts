import { groupBy, isNil, sumBy } from 'lodash-es';
import { z } from 'zod';
import type { Department } from '../../referential/Department';
import type { Region } from '../../referential/Region';
import type { LocalPrescription } from '../LocalPrescription/LocalPrescription';
import type { Prescription } from '../Prescription/Prescription';
import type { DistributionKind } from './DistributionKind';
import type { ProgrammingPlanStatus } from './ProgrammingPlanStatus';

export const ProgrammingPlanEchelon = z.enum([
  'National',
  'Regional',
  'Departmental'
]);
export type ProgrammingPlanEchelon = z.infer<typeof ProgrammingPlanEchelon>;

export const ProgrammingPlanDisplayStatus = z.enum([
  'Pending',
  'InProgress',
  'Submitted',
  'ReadyToSend',
  'NotApplicable'
]);
export type ProgrammingPlanDisplayStatus = z.infer<
  typeof ProgrammingPlanDisplayStatus
>;

const ProgrammingPlanDisplayStatusLabels: Record<
  ProgrammingPlanDisplayStatus,
  string
> = {
  Pending: 'En attente',
  InProgress: 'En cours',
  Submitted: 'Soumis',
  ReadyToSend: 'Terminé, à envoyer',
  NotApplicable: 'N/A'
};

const submittedLabel = (
  echelon: ProgrammingPlanEchelon,
  distributionKind: DistributionKind,
  status?: ProgrammingPlanStatus | null
): string => {
  if (echelon === 'National') {
    return status === 'SubmittedToAdmin'
      ? "Soumis à l'admin"
      : 'Soumis aux régions';
  }
  if (echelon === 'Regional') {
    return distributionKind === 'SLAUGHTERHOUSE'
      ? 'Soumis aux départements'
      : 'Diffusé aux préleveurs';
  }
  return 'Diffusé aux préleveurs';
};

const receivedStatusesByEchelon: Record<
  Exclude<ProgrammingPlanEchelon, 'National'>,
  ProgrammingPlanStatus[]
> = {
  Regional: [
    'SubmittedToRegion',
    'SubmittedToDepartments',
    'Validated',
    'Closed'
  ],
  Departmental: ['SubmittedToDepartments', 'Validated', 'Closed']
};

const sentStatusesByEchelon = (
  distributionKind: DistributionKind
): Record<ProgrammingPlanEchelon, ProgrammingPlanStatus[]> => ({
  National: [
    'SubmittedToAdmin',
    'SubmittedToRegion',
    'SubmittedToDepartments',
    'Validated',
    'Closed'
  ],
  Regional:
    distributionKind === 'REGIONAL'
      ? ['Validated', 'Closed']
      : ['SubmittedToDepartments', 'Validated', 'Closed'],
  Departmental: ['Validated', 'Closed']
});

export const hasSentOnward = (
  echelon: ProgrammingPlanEchelon,
  distributionKind: DistributionKind,
  status?: ProgrammingPlanStatus | null
): boolean => {
  if (!status) {
    return false;
  }
  return sentStatusesByEchelon(distributionKind)[echelon].includes(status);
};

const hasReceivedFromAbove = (
  echelon: ProgrammingPlanEchelon,
  status: ProgrammingPlanStatus | null | undefined,
  distributionKind: DistributionKind,
  viewerOwnsNationalRow: boolean
): boolean => {
  if (echelon === 'National') {
    return (
      viewerOwnsNationalRow ||
      hasSentOnward('National', distributionKind, status)
    );
  }
  if (!status) {
    return false;
  }
  return receivedStatusesByEchelon[echelon].includes(status);
};

interface DisplayStatusInput {
  status?: ProgrammingPlanStatus | null;
  sentAt?: Date | null;
  lastModifiedAt?: Date | null;
  hasPendingChange?: boolean | null;
  needsResend?: boolean | null;
  hasAnyProgrammedSample: boolean;
  isComplete: boolean;
  echelon: ProgrammingPlanEchelon;
  distributionKind: DistributionKind;
  viewerOwnsNationalRow?: boolean;
}

export interface DisplayStatusResult {
  value: ProgrammingPlanDisplayStatus;
  label: string;
  modified: boolean;
  sentAt: Date | null;
  lastModifiedAt: Date | null;
}

export const isModifiedSinceSent = (
  sentAt: Date | null,
  lastModifiedAt: Date | null
): boolean => Boolean(sentAt && lastModifiedAt && lastModifiedAt > sentAt);

export const computeDisplayStatus = (
  input: DisplayStatusInput
): DisplayStatusResult => {
  const sentAt = input.sentAt ?? null;
  const lastModifiedAt = input.lastModifiedAt ?? null;

  if (!input.hasAnyProgrammedSample) {
    return {
      value: 'NotApplicable',
      label: ProgrammingPlanDisplayStatusLabels.NotApplicable,
      modified: false,
      sentAt,
      lastModifiedAt
    };
  }

  if (
    !hasReceivedFromAbove(
      input.echelon,
      input.status,
      input.distributionKind,
      input.viewerOwnsNationalRow ?? true
    )
  ) {
    return {
      value: 'Pending',
      label: ProgrammingPlanDisplayStatusLabels.Pending,
      modified: false,
      sentAt,
      lastModifiedAt
    };
  }

  if (
    input.echelon === 'National' &&
    input.viewerOwnsNationalRow === false &&
    input.status === 'SubmittedToAdmin'
  ) {
    return input.isComplete
      ? {
          value: 'ReadyToSend',
          label: 'Terminé, à envoyer',
          modified: false,
          sentAt,
          lastModifiedAt
        }
      : {
          value: 'InProgress',
          label: ProgrammingPlanDisplayStatusLabels.InProgress,
          modified: false,
          sentAt,
          lastModifiedAt
        };
  }

  const hasBeenTouched =
    input.echelon === 'National' || lastModifiedAt !== null;
  const needsSend =
    input.isComplete &&
    hasBeenTouched &&
    (sentAt === null || input.hasPendingChange === true);

  if (needsSend) {
    return {
      value: 'ReadyToSend',
      label: sentAt === null ? 'Terminé, à envoyer' : 'Modifié, à envoyer',
      modified: sentAt !== null,
      sentAt,
      lastModifiedAt
    };
  }

  if (
    input.echelon !== 'National' &&
    input.isComplete &&
    input.needsResend === true
  ) {
    return {
      value: 'InProgress',
      label: ProgrammingPlanDisplayStatusLabels.InProgress,
      modified: true,
      sentAt,
      lastModifiedAt
    };
  }

  if (
    input.isComplete &&
    hasSentOnward(input.echelon, input.distributionKind, input.status)
  ) {
    return {
      value: 'Submitted',
      label: submittedLabel(
        input.echelon,
        input.distributionKind,
        input.status
      ),
      modified: false,
      sentAt,
      lastModifiedAt
    };
  }

  return {
    value: 'InProgress',
    label: ProgrammingPlanDisplayStatusLabels.InProgress,
    modified: false,
    sentAt,
    lastModifiedAt
  };
};

interface CompletenessResult {
  isComplete: boolean;
  hasAnyProgrammedSample: boolean;
  programmedCount: number;
  attributedCount: number;
}

export const computeCompleteness = (
  prescriptions: Pick<Prescription, 'id' | 'sampleCount'>[],
  localPrescriptions: Pick<
    LocalPrescription,
    'prescriptionId' | 'region' | 'department' | 'companySiret' | 'sampleCount'
  >[],
  echelon: ProgrammingPlanEchelon,
  distributionKind?: DistributionKind,
  region?: Region,
  department?: Department
): CompletenessResult => {
  if (echelon === 'National') {
    const attributedCount = sumBy(prescriptions, 'sampleCount');
    const regionalByPrescription = groupBy(
      localPrescriptions.filter((lp) => isNil(lp.department)),
      'prescriptionId'
    );
    const isComplete =
      prescriptions.length > 0 &&
      prescriptions.every(
        (p) =>
          sumBy(regionalByPrescription[p.id] ?? [], 'sampleCount') ===
          p.sampleCount
      );
    return {
      isComplete,
      hasAnyProgrammedSample: attributedCount > 0,
      programmedCount: attributedCount,
      attributedCount
    };
  }

  const scoped = localPrescriptions.filter((lp) =>
    echelon === 'Regional'
      ? lp.region === region && isNil(lp.department)
      : lp.region === region &&
        lp.department === department &&
        isNil(lp.companySiret)
  );
  const scopedByPrescription = groupBy(scoped, 'prescriptionId');
  const programmedCount = sumBy(scoped, 'sampleCount');

  const hasRowForEveryPrescription = prescriptions.every(
    (p) => (scopedByPrescription[p.id] ?? []).length > 0
  );

  const isReconciledWithChildren =
    echelon === 'Regional' && distributionKind !== 'REGIONAL'
      ? prescriptions.every((p) => {
          const regionalSampleCount =
            scopedByPrescription[p.id]?.[0]?.sampleCount ?? 0;
          const departmentSum = sumBy(
            localPrescriptions.filter(
              (lp) =>
                lp.prescriptionId === p.id &&
                lp.region === region &&
                !isNil(lp.department) &&
                isNil(lp.companySiret)
            ),
            'sampleCount'
          );
          return departmentSum === regionalSampleCount;
        })
      : true;

  return {
    isComplete: hasRowForEveryPrescription && isReconciledWithChildren,
    hasAnyProgrammedSample: programmedCount > 0,
    programmedCount,
    attributedCount: sumBy(prescriptions, 'sampleCount')
  };
};
