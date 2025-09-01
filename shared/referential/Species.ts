import { z } from 'zod/v4';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';

export const Species = z.enum(
  [
    'ESP1',
    'ESP2',
    'ESP3',
    'ESP4',
    'ESP5',
    'ESP6',
    'ESP7',
    'ESP8',
    'ESP9',
    'ESP10',
    'ESP11',
    'ESP12',
    'ESP13',
    'ESP14',
    'ESP15',
    'ESP16',
    'ESP17',
    'ESP18',
    'ESP19'
  ],
  {
    error: () => "Veuillez renseigner l'espèce."
  }
);

export type Species = z.infer<typeof Species>;

//TODO mettre à jour la codification après ESP7
export const SpeciesLabels: Record<Species, string> = {
  ESP1: 'Bovin',
  ESP2: 'Ovin',
  ESP3: 'Caprin',
  ESP4: 'Porcin',
  ESP5: 'Volaille poule',
  ESP6: 'Volaille caille',
  ESP7: 'Poulet de chair ou coquelet',
  ESP8: 'Poule de réforme',
  ESP9: 'Coq de réforme',
  ESP10: 'Dinde',
  ESP11: 'Dindon',
  ESP12: 'Canard',
  ESP13: 'Pintade',
  ESP14: 'Oie',
  ESP15: 'Chapon/Poularde',
  ESP16: 'Caille',
  ESP17: 'Perdrix',
  ESP18: 'Pigeon',
  ESP19: 'Faisan'
};

export const SpeciesByProgrammingPlanKind: Partial<
  Record<ProgrammingPlanKind, Species[]>
> = {
  [ProgrammingPlanKind.enum.PFAS_MEAT]: ['ESP1', 'ESP2', 'ESP3', 'ESP4'],
  [ProgrammingPlanKind.enum.PFAS_EGGS]: ['ESP5', 'ESP6'],
  [ProgrammingPlanKind.enum.DAOA_BREEDING]: [
    'ESP7',
    'ESP8',
    'ESP9',
    'ESP10',
    'ESP11',
    'ESP12',
    'ESP13',
    'ESP14',
    'ESP15',
    'ESP16',
    'ESP17',
    'ESP18',
    'ESP19'
  ]
};
