import { z } from 'zod';

export const TargetingCriteria = z.enum(
  [
    'CIBLAGE1',
    'CIBLAGE2',
    'CIBLAGE3',
    'CIBLAGE4',
    'CIBLAGE5',
    'CIBLAGE6',
    'CIBLAGE7',
    'CIBLAGE8'
  ],
  {
    errorMap: () => ({
      message: 'Veuillez renseigner le critère de ciblage.'
    })
  }
);

export type TargetingCriteria = z.infer<typeof TargetingCriteria>;

export const TargetingCriteriaList: TargetingCriteria[] =
  TargetingCriteria.options;

export const TargetingCriteriaLabels: Record<TargetingCriteria, string> = {
  CIBLAGE1: 'Historique de non-conformité',
  CIBLAGE2: 'Animal ayant accès à l’extérieur',
  CIBLAGE3: 'Animal en provenance d’une zone comprenant une ICPE',
  CIBLAGE4:
    "Animal en provenance d’une zone présentant une activité potentiellement polluante passée ou présente, autre qu'une ICPE",
  CIBLAGE5:
    'Animal provenant d’une zone avec un bruit de fond habituel en certains contaminants',
  CIBLAGE6:
    "Connaissance d'installations, de matériels, de matériaux potentiellement polluants dans l’élevage",
  CIBLAGE7: 'Animal âgé',
  CIBLAGE8: 'Autre critère de ciblage'
};
