import { z } from 'zod';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';

export const Species = z.enum(
  ['ESP1', 'ESP2', 'ESP3', 'ESP4', 'ESP5', 'ESP6'],
  {
    errorMap: () => ({
      message: "Veuillez renseigner l'espèce."
    })
  }
);

export type Species = z.infer<typeof Species>;

export const SpeciesLabels: Record<Species, string> = {
  ESP1: 'Bovin',
  ESP2: 'Ovin',
  ESP3: 'Caprin',
  ESP4: 'Porcin',
  ESP5: 'Volaille poule',
  ESP6: 'Volaille caille'
};

export const SpeciesByProgrammingPlanKind: Partial<
  Record<ProgrammingPlanKind, Species[]>
> = {
  [ProgrammingPlanKind.Values.PFAS_MEAT]: ['ESP1', 'ESP2', 'ESP3', 'ESP4'],
  [ProgrammingPlanKind.Values.PFAS_EGGS]: ['ESP5', 'ESP6']
};
