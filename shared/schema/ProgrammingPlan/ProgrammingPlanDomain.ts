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

export const ProgrammingPlanDomainUpdateInput =
  ProgrammingPlanDomainCreateInput.pick({ label: true });

export type ProgrammingPlanDomainUpdateInput = z.infer<
  typeof ProgrammingPlanDomainUpdateInput
>;

export const canInitiateNextCampaign = (
  years: number[],
  year: number,
  today: Date
) =>
  year === today.getFullYear() &&
  years.includes(year) &&
  !years.includes(year + 1);
