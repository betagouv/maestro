import { z } from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const LaboratoryAgreementRowKey = z.object({
  programmingPlanId: z.guid(),
  programmingPlanKind: ProgrammingPlanKind,
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

export type LaboratoryAgreementRowKey = z.infer<
  typeof LaboratoryAgreementRowKey
>;
export type LaboratoryAgreement = z.infer<typeof LaboratoryAgreement>;
export type LaboratoryAgreementUpdate = z.infer<
  typeof LaboratoryAgreementUpdate
>;

export const agreementLabels: Record<
  keyof Pick<
    LaboratoryAgreement,
    'referenceLaboratory' | 'detectionAnalysis' | 'confirmationAnalysis'
  >,
  string
> = {
  referenceLaboratory: 'Laboratoire national de référence',
  detectionAnalysis: 'Réalise les analyses de première intention',
  confirmationAnalysis: 'Réalise les analyses de confirmation'
};
