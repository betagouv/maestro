import { z } from 'zod';
import { SampleItemRecipientKind } from '../Sample/SampleItemRecipientKind';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const ProgrammingPlanSampleCopySetting = z.object({
  required: z.boolean(),
  recipientKinds: z
    .array(SampleItemRecipientKind)
    .min(1, 'Veuillez sélectionner au moins un destinataire.')
});
export type ProgrammingPlanSampleCopySetting = z.infer<
  typeof ProgrammingPlanSampleCopySetting
>;

export const ProgrammingPlanSampleSetting = z.object({
  substanceKinds: z.array(SubstanceKind),
  copies: z.tuple([
    z.object({
      required: z.literal(true),
      recipientKinds: z.tuple([z.literal('Laboratory')])
    }),
    ProgrammingPlanSampleCopySetting,
    ProgrammingPlanSampleCopySetting
  ])
});
export type ProgrammingPlanSampleSetting = z.infer<
  typeof ProgrammingPlanSampleSetting
>;

export const ProgrammingPlanSampleMaxCount = 10;

export const defaultProgrammingPlanSample: ProgrammingPlanSampleSetting = {
  substanceKinds: [],
  copies: [
    { required: true, recipientKinds: ['Laboratory'] },
    { required: false, recipientKinds: ['Sampler', 'Operator'] },
    { required: false, recipientKinds: ['Sampler', 'Operator'] }
  ]
};
