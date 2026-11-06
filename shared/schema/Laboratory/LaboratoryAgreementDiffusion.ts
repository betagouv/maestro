import { z } from 'zod';

export const LaboratoryAgreementDiffusion = z.object({
  year: z.number().int(),
  diffusedAt: z.coerce.date(),
  diffusedBy: z.guid().nullish()
});

export type LaboratoryAgreementDiffusion = z.infer<
  typeof LaboratoryAgreementDiffusion
>;
