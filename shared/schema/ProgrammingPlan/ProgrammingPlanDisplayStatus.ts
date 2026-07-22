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

export const ProgrammingPlanDisplayStatusLabels: Record<
  ProgrammingPlanDisplayStatus,
  string
> = {
  Pending: 'En attente',
  InProgress: 'En cours',
  Submitted: 'Soumis',
  ReadyToSend: 'Terminé, à envoyer',
  NotApplicable: 'N/A'
};

export const submittedLabel = (
  echelon: ProgrammingPlanEchelon,
  distributionKind: DistributionKind
): string => {
  if (echelon === 'National') {
    return 'Soumis aux régions';
  }
  if (echelon === 'Regional') {
    return distributionKind === 'SLAUGHTERHOUSE'
      ? 'Soumis aux départements'
      : 'Diffusé aux préleveurs';
  }
  return 'Diffusé aux préleveurs';
};

// A department row only exists in DB once its region has cascaded SubmittedToDepartments to it,
// so "received" for Departmental is really "does a row exist at all" — status is always set once it does.
const receivedStatusesByEchelon: Record<
  Exclude<ProgrammingPlanEchelon, 'National'>,
  ProgrammingPlanStatus[]
> = {
  Regional: [
    'SubmittedToRegion',
    'ApprovedByRegion',
    'SubmittedToDepartments',
    'Validated',
    'Closed'
  ],
  Departmental: ['SubmittedToDepartments', 'Validated', 'Closed']
};

export const hasReceivedFromAbove = (
  echelon: ProgrammingPlanEchelon,
  status?: ProgrammingPlanStatus | null
): boolean => {
  if (echelon === 'National') {
    return true;
  }
  if (!status) {
    return false;
  }
  return receivedStatusesByEchelon[echelon].includes(status);
};

const sentStatusesByEchelon = (
  distributionKind: DistributionKind
): Record<ProgrammingPlanEchelon, ProgrammingPlanStatus[]> => ({
  National: [
    'SubmittedToRegion',
    'SubmittedToDepartments',
    'ApprovedByRegion',
    'Validated',
    'Closed'
  ],
  Regional:
    distributionKind === 'SLAUGHTERHOUSE'
      ? ['SubmittedToDepartments', 'Validated', 'Closed']
      : ['Validated', 'Closed'],
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

export interface DisplayStatusInput {
  status?: ProgrammingPlanStatus | null;
  sentAt?: Date | null;
  lastModifiedAt?: Date | null;
  hasAnyProgrammedSample: boolean;
  isComplete: boolean;
  echelon: ProgrammingPlanEchelon;
  distributionKind: DistributionKind;
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

  if (!hasReceivedFromAbove(input.echelon, input.status)) {
    return {
      value: 'Pending',
      label: ProgrammingPlanDisplayStatusLabels.Pending,
      modified: false,
      sentAt,
      lastModifiedAt
    };
  }

  const modifiedSinceSent = isModifiedSinceSent(sentAt, lastModifiedAt);
  const needsSend = input.isComplete && (sentAt === null || modifiedSinceSent);

  if (needsSend) {
    return {
      value: 'ReadyToSend',
      label: sentAt === null ? 'Terminé, à envoyer' : 'Modifié, à envoyer',
      modified: sentAt !== null,
      sentAt,
      lastModifiedAt
    };
  }

  if (hasSentOnward(input.echelon, input.distributionKind, input.status)) {
    return {
      value: 'Submitted',
      label: submittedLabel(input.echelon, input.distributionKind),
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

export interface CompletenessResult {
  isComplete: boolean;
  hasAnyProgrammedSample: boolean;
  programmedCount: number;
  attributedCount: number;
}

// Completeness = "has data been entered for this echelon's own share of the plan":
// - National: every prescription has a non-zero national sampleCount ("matrices renseignées").
// - Regional/Departmental: every prescription of the plan has a LocalPrescription row at this
//   echelon's scope — a distributed count of 0 is a legitimate, final allocation (e.g. a matrix
//   that isn't produced in that region), not "not yet entered", so it counts as done. Rows are
//   created eagerly (sampleCount: 0) for every region/department as soon as a prescription
//   exists (see prescriptionController.ts), so this only fails while a prescription is still
//   missing entirely for that scope.
export const computeCompleteness = (
  prescriptions: Pick<Prescription, 'id' | 'sampleCount'>[],
  localPrescriptions: Pick<
    LocalPrescription,
    'prescriptionId' | 'region' | 'department' | 'sampleCount'
  >[],
  echelon: ProgrammingPlanEchelon,
  region?: Region,
  department?: Department
): CompletenessResult => {
  if (echelon === 'National') {
    const attributedCount = sumBy(prescriptions, 'sampleCount');
    return {
      isComplete: prescriptions.every((p) => p.sampleCount > 0),
      hasAnyProgrammedSample: attributedCount > 0,
      programmedCount: attributedCount,
      attributedCount
    };
  }

  const scoped = localPrescriptions.filter((lp) =>
    echelon === 'Regional'
      ? lp.region === region && isNil(lp.department)
      : lp.region === region && lp.department === department
  );
  const scopedByPrescription = groupBy(scoped, 'prescriptionId');
  const programmedCount = sumBy(scoped, 'sampleCount');

  return {
    isComplete: prescriptions.every(
      (p) => (scopedByPrescription[p.id] ?? []).length > 0
    ),
    hasAnyProgrammedSample: programmedCount > 0,
    programmedCount,
    attributedCount: sumBy(prescriptions, 'sampleCount')
  };
};
