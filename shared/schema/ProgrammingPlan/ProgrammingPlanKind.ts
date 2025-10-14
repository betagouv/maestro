import { z } from 'zod';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const ProgrammingPlanKind = z.enum(
  ['PPV', 'PFAS_EGGS', 'PFAS_MEAT', 'DAOA_BREEDING', 'DAOA_SLAUGHTER'],
  {
    error: () => 'Veuillez renseigner le type de plan.'
  }
);

export type ProgrammingPlanKind = z.infer<typeof ProgrammingPlanKind>;

export const ProgrammingPlanKindList: ProgrammingPlanKind[] =
  ProgrammingPlanKind.options;

export const ProgrammingPlanKindLabels: Record<ProgrammingPlanKind, string> = {
  PPV: 'Production primaire végétale',
  PFAS_EGGS: 'Oeuf à l’élevage ou en centre d’emballage',
  PFAS_MEAT: 'Produit carné à l’abattoir',
  DAOA_BREEDING: 'Abattoir / Viande de volaille',
  DAOA_SLAUGHTER: 'Abattoir / Foie de bovin'
};

export const ProgrammingPlanKindSubstanceKinds: Record<
  ProgrammingPlanKind,
  SubstanceKind[]
> = {
  PPV: ['Any'],
  PFAS_EGGS: ['Any'],
  PFAS_MEAT: ['Any'],
  DAOA_BREEDING: ['Mono', 'Multi', 'Copper'],
  DAOA_SLAUGHTER: ['Mono', 'Multi', 'Copper']
};
