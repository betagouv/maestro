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
    // Every applicable result shares the same echelon/distributionKind for a
    // given plan, so their "Submitted" label (e.g. "Soumis aux départements",
    // "Diffusé aux préleveurs") is already consistent — reuse it as-is.
    return { value: 'Submitted', label: applicable[0].label };
  }

  // "Pending" only when nothing has been received from above yet — once at
  // least one row has received it (even if none have been sent onward yet),
  // this is "In progress", not "waiting", otherwise a freshly-received batch
  // looks indistinguishable from one that was never sent at all.
  const pending = applicable.filter((_) => _.value === 'Pending').length;
  if (pending === total) {
    return { value: 'Pending', label: 'En attente' };
  }

  return {
    value: 'InProgress',
    label: 'En cours',
    ratio: { sent, total }
  };
};
