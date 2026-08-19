import { z } from 'zod';

export const ProgrammingPlanDomainId = z
  .string({ error: () => 'Veuillez renseigner le domaine.' })
  .brand<'ProgrammingPlanDomainId'>();
export type ProgrammingPlanDomainId = z.infer<typeof ProgrammingPlanDomainId>;

export const ProgrammingPlanDomain = z.object({
  id: ProgrammingPlanDomainId,
  label: z.string()
});

export type ProgrammingPlanDomain = z.infer<typeof ProgrammingPlanDomain>;
