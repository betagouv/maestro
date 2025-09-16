import { z } from 'zod';

export const ProgrammingPlanDomain = z.enum(
  ['PESTICIDE_RESIDUE', 'CHEMICAL_CONTAMINANT'],
  {
    error: () => 'Veuillez renseigner le domaine.'
  }
);

export type ProgrammingPlanDomain = z.infer<typeof ProgrammingPlanDomain>;

export const ProgrammingPlanDomainList: ProgrammingPlanDomain[] =
  ProgrammingPlanDomain.options;

export const ProgrammingPlanDomainLabels: Record<
  ProgrammingPlanDomain,
  string
> = {
  PESTICIDE_RESIDUE: 'Résidus de pesticides',
  CHEMICAL_CONTAMINANT: 'Contaminants chimiques'
};
