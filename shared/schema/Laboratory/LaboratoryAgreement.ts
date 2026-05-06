import { z } from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const LaboratoryAgreementRowKey = z.object({
  programmingPlanId: z.guid(),
  programmingPlanKind: ProgrammingPlanKind,
  substanceKind: SubstanceKind
});

export const LaboratoryAgreement = z.object({
  laboratoryId: z.guid(),
  laboratoryName: z.string(),
  laboratoryShortName: z.string(),
  programmingPlanId: z.guid(),
  programmingPlanKind: ProgrammingPlanKind,
  programmingPlanYear: z.number().int(),
  substanceKind: SubstanceKind,
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
