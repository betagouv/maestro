import { z } from 'zod';

export const ProgrammingPlanDomainId = z
  .string({ error: () => 'Veuillez renseigner le domaine.' })
  .brand<'ProgrammingPlanDomainId'>();
export type ProgrammingPlanDomainId = z.infer<typeof ProgrammingPlanDomainId>;

export const ProgrammingPlanDomain = z.object({
  id: ProgrammingPlanDomainId,
  label: z.string(),
  year: z.number()
});

export type ProgrammingPlanDomain = z.infer<typeof ProgrammingPlanDomain>;

export const ProgrammingPlanDomainCreateInput = z.object({
  label: z
    .string({ error: () => 'Veuillez renseigner le libellé du domaine.' })
    .trim()
    .min(1, { error: () => 'Veuillez renseigner le libellé du domaine.' }),
  year: z
    .number({ error: () => "Veuillez renseigner l'année du domaine." })
    .int()
});

export type ProgrammingPlanDomainCreateInput = z.infer<
  typeof ProgrammingPlanDomainCreateInput
>;
