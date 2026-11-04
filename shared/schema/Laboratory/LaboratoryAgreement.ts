import { z } from 'zod';
import { groupSubstanceKindsBySample } from '../ProgrammingPlan/ProgrammingPlanSampleSetting';
import type { ProgrammingSubPlan } from '../ProgrammingPlan/ProgrammingSubPlan';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const LaboratoryAgreementRowKey = z.object({
  programmingSubPlanId: ProgrammingSubPlanId,
  substanceKind: SubstanceKind
});

export const LaboratoryAgreement = z.object({
  ...LaboratoryAgreementRowKey.shape,
  laboratoryId: z.guid(),
  referenceLaboratory: z.boolean(),
  detectionAnalysis: z.boolean(),
  confirmationAnalysis: z.boolean()
});

export const LaboratoryAgreementUpdate = z.object({
  laboratoryAgreementRowKey: LaboratoryAgreementRowKey,
  referenceLaboratory: z.boolean(),
  detectionAnalysis: z.boolean(),
  confirmationAnalysis: z.boolean()
});

export const LaboratoryAgreementCheckUpdate = LaboratoryAgreementRowKey.extend({
  checked: z.boolean()
});

export type LaboratoryAgreementRowKey = z.infer<
  typeof LaboratoryAgreementRowKey
>;
export type LaboratoryAgreement = z.infer<typeof LaboratoryAgreement>;
export type LaboratoryAgreementUpdate = z.infer<
  typeof LaboratoryAgreementUpdate
>;
export type LaboratoryAgreementCheckUpdate = z.infer<
  typeof LaboratoryAgreementCheckUpdate
>;

export type LaboratoryAgreementField = keyof Pick<
  LaboratoryAgreement,
  'referenceLaboratory' | 'detectionAnalysis' | 'confirmationAnalysis'
>;

export const LaboratoryAgreementFields = [
  'referenceLaboratory',
  'detectionAnalysis',
  'confirmationAnalysis'
] as LaboratoryAgreementField[];

export const agreementLabels: Record<LaboratoryAgreementField, string> = {
  referenceLaboratory: 'Laboratoire national de référence',
  detectionAnalysis: 'Réalise les analyses de première intention',
  confirmationAnalysis: 'Réalise les analyses de confirmation'
};

export type AgreementSubPlan = Pick<
  ProgrammingSubPlan,
  'id' | 'subPlanNumber' | 'samples' | 'substanceKinds'
>;

export const laboratoryAgreementRows = <T extends AgreementSubPlan>(
  subPlans: T[],
  agreements: LaboratoryAgreement[]
): {
  subPlan: T;
  substanceKinds: SubstanceKind[];
  agreements: LaboratoryAgreement[];
}[] =>
  subPlans.flatMap((subPlan) =>
    groupSubstanceKindsBySample(
      subPlan.samples,
      subPlan.substanceKinds ?? []
    ).map((substanceKinds) => ({
      subPlan,
      substanceKinds,
      agreements: agreements.filter(
        (agreement) =>
          agreement.programmingSubPlanId === subPlan.id &&
          substanceKinds.includes(agreement.substanceKind)
      )
    }))
  );

export const hasAnalysisLaboratory = (
  agreements: LaboratoryAgreement[]
): boolean =>
  agreements.some(
    (agreement) => agreement.detectionAnalysis || agreement.confirmationAnalysis
  );

export const subPlanNumbersMissingAgreements = (
  subPlans: AgreementSubPlan[],
  agreements: LaboratoryAgreement[]
): string[] => [
  ...new Set(
    laboratoryAgreementRows(subPlans, agreements)
      .filter((row) => !hasAnalysisLaboratory(row.agreements))
      .map((row) => row.subPlan.subPlanNumber)
  )
];
