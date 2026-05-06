import { z } from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { SubstanceKind } from '../Substance/SubstanceKind';

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

export type LaboratoryAgreement = z.infer<typeof LaboratoryAgreement>;

export const AgreementUpdate = z.object({
  laboratoryId: z.guid(),
  referenceLaboratory: z.boolean(),
  detectionAnalysis: z.boolean(),
  confirmationAnalysis: z.boolean()
});

export type AgreementUpdate = z.infer<typeof AgreementUpdate>;

export const UpdateAgreementsInput = z.object({
  programmingPlanId: z.guid(),
  programmingPlanKind: ProgrammingPlanKind,
  substanceKind: SubstanceKind,
  agreements: z.array(AgreementUpdate)
});

export type UpdateAgreementsInput = z.infer<typeof UpdateAgreementsInput>;
