import type { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import {
  computeCompleteness,
  computeDisplayStatus,
  type DisplayStatusResult,
  type ProgrammingPlanEchelon
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import type { ProgrammingPlanLocalStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';

export const buildEchelonDisplayStatus = (
  programmingPlan: ProgrammingPlanChecked,
  prescriptions: Prescription[],
  localPrescriptions: LocalPrescription[],
  echelon: ProgrammingPlanEchelon,
  region?: Region,
  department?: Department
): DisplayStatusResult => {
  const localStatus: ProgrammingPlanLocalStatus | undefined =
    echelon === 'National'
      ? programmingPlan.nationalStatus
      : echelon === 'Regional'
        ? programmingPlan.regionalStatus.find((_) => _.region === region)
        : programmingPlan.departmentalStatus.find(
            (_) => _.region === region && _.department === department
          );

  const completeness = computeCompleteness(
    prescriptions,
    localPrescriptions,
    echelon,
    region,
    department
  );

  return computeDisplayStatus({
    status: localStatus?.status,
    sentAt: localStatus?.sentAt,
    lastModifiedAt: localStatus?.lastModifiedAt,
    hasAnyProgrammedSample: completeness.hasAnyProgrammedSample,
    isComplete: completeness.isComplete,
    echelon,
    distributionKind: programmingPlan.distributionKind
  });
};

export interface AggregateDisplayStatus {
  value: 'Submitted' | 'InProgress' | 'Pending' | 'NotApplicable';
  label: string;
  ratio?: { sent: number; total: number };
}

export const buildAggregateDisplayStatus = (
  results: DisplayStatusResult[]
): AggregateDisplayStatus => {
  const applicable = results.filter((_) => _.value !== 'NotApplicable');

  if (applicable.length === 0) {
    return { value: 'NotApplicable', label: 'N/A' };
  }

  const sent = applicable.filter((_) => _.value === 'Submitted').length;
  const total = applicable.length;

  if (sent === total) {
    return { value: 'Submitted', label: 'Soumis' };
  }
  if (sent === 0) {
    return { value: 'Pending', label: 'En attente' };
  }
  return {
    value: 'InProgress',
    label: 'En cours',
    ratio: { sent, total }
  };
};
