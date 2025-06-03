import { z } from 'zod/v4';

export const ProgrammingPlanKind = z.enum(['PPV', 'PFAS_EGGS', 'PFAS_MEAT'], {
  error: () => 'Veuillez renseigner le type de plan.'
});

export type ProgrammingPlanKind = z.infer<typeof ProgrammingPlanKind>;

export const ProgrammingPlanKindList: ProgrammingPlanKind[] =
  ProgrammingPlanKind.options;

export const PFASKindList: ProgrammingPlanKind[] = ['PFAS_EGGS', 'PFAS_MEAT'];

export const ProgrammingPlanKindLabels: Record<ProgrammingPlanKind, string> = {
  PPV: 'Production primaire végétale',
  PFAS_EGGS: 'PFAS - Oeuf à l’élevage ou en centre d’emballage',
  PFAS_MEAT: 'PFAS - Produit carné à l’abattoir'
};
