import { z } from 'zod/v4';

export const ProgrammingPlanKind = z.enum(
  ['PPV', 'PFAS_EGGS', 'PFAS_MEAT', 'DAOA_BREEDING', 'DAOA_SLAUGHTER'],
  {
    error: () => 'Veuillez renseigner le type de plan.'
  }
);

export type ProgrammingPlanKind = z.infer<typeof ProgrammingPlanKind>;

export const ProgrammingPlanKindList: ProgrammingPlanKind[] =
  ProgrammingPlanKind.options;

export const PFASKindList: ProgrammingPlanKind[] = ['PFAS_EGGS', 'PFAS_MEAT'];
export const DAOAKindList: ProgrammingPlanKind[] = [
  'DAOA_BREEDING',
  'DAOA_SLAUGHTER'
];

export const ProgrammingPlanKindLabels: Record<ProgrammingPlanKind, string> = {
  PPV: 'Production primaire végétale',
  PFAS_EGGS: 'PFAS - Oeuf à l’élevage ou en centre d’emballage',
  PFAS_MEAT: 'PFAS - Produit carné à l’abattoir',
  DAOA_BREEDING:
    'Résidus de pesticides / Denrée d’origine animale / Abattoir / Foie de bovin',
  DAOA_SLAUGHTER:
    'Résidus de pesticides / Denrée d’origine animale / Abattoir / Viande de volaille'
};
