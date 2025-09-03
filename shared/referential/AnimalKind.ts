import { z } from 'zod';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';

export const AnimalKind = z.enum(
  [
    'TYPEA1',
    'TYPEA2',
    'TYPEA3',
    'TYPEA4',
    'TYPEA5',
    'TYPEA6',
    'TYPEA7',
    'TYPEA8',
    'TYPEA9',
    'TYPEA10',
    'TYPEA11',
    'TYPEA12',
    'TYPEA13',
    'TYPEA14'
  ],
  {
    error: () => "Veuillez renseigner le type d'animal."
  }
);

export type AnimalKind = z.infer<typeof AnimalKind>;

export const AnimalKindLabels: Record<AnimalKind, string> = {
  TYPEA1: 'Veau < 6 mois',
  TYPEA2: 'Jeune bovin entre 6 et 24 mois',
  TYPEA3: 'Bovin > 24 mois hors vache de réforme',
  TYPEA4: 'Vache de réforme',
  TYPEA5: 'Caprin ≤ 3 mois',
  TYPEA6: 'Caprin > 3 mois',
  TYPEA7: 'Ovin < 3 mois',
  TYPEA8: 'Ovin entre 3 et 12 mois',
  TYPEA9: 'Ovin > 12 mois',
  TYPEA10: 'Porcelet',
  TYPEA11: 'Porc charcutier',
  TYPEA12: 'Truie ou verrat de réforme',
  TYPEA13: 'Caille',
  TYPEA14: 'Poule - Gallus gallus'
};

export const AnimalKindAgeLimit: Record<
  AnimalKind,
  {
    min?: number;
    max?: number;
  }
> = {
  TYPEA1: { max: 5 },
  TYPEA2: { min: 6, max: 24 },
  TYPEA3: { min: 25 },
  TYPEA4: {},
  TYPEA5: { max: 3 },
  TYPEA6: { min: 4 },
  TYPEA7: { max: 2 },
  TYPEA8: { min: 3, max: 12 },
  TYPEA9: { min: 13 },
  TYPEA10: {},
  TYPEA11: {},
  TYPEA12: {},
  TYPEA13: {},
  TYPEA14: {}
};

export const AnimalKindsByProgrammingPlanKind: Partial<
  Record<ProgrammingPlanKind, AnimalKind[]>
> = {
  [ProgrammingPlanKind.enum.PFAS_MEAT]: [
    'TYPEA1',
    'TYPEA2',
    'TYPEA3',
    'TYPEA4',
    'TYPEA5',
    'TYPEA6',
    'TYPEA7',
    'TYPEA8',
    'TYPEA9',
    'TYPEA10',
    'TYPEA11',
    'TYPEA12'
  ],
  [ProgrammingPlanKind.enum.PFAS_EGGS]: ['TYPEA13', 'TYPEA14'],
  [ProgrammingPlanKind.enum.DAOA_SLAUGHTER]: [
    'TYPEA1',
    'TYPEA2',
    'TYPEA3',
    'TYPEA4'
  ]
};
