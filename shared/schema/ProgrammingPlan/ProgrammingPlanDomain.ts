import { z } from 'zod';

export const ProgrammingPlanDomain = z.enum(
  ['PESTICIDE_RESIDUE', 'CHEMICAL_CONTAMINANT', 'TO_BE_DEFINED'],
  {
    error: () => 'Veuillez renseigner le domaine.'
  }
);

export type ProgrammingPlanDomain = z.infer<typeof ProgrammingPlanDomain>;

export const ProgrammingPlanDomainLabels: Record<
  ProgrammingPlanDomain,
  string
> = {
  PESTICIDE_RESIDUE: 'Résidus de pesticides',
  CHEMICAL_CONTAMINANT: 'Contaminants chimiques',
  TO_BE_DEFINED: 'A définir'
};
