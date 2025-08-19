import { z } from 'zod/v4';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';

export const Stage = z.enum(
  [
    'STADE1',
    'STADE2',
    'STADE3',
    'STADE4',
    'STADE5',
    'STADE6',
    'STADE7',
    'STADE8',
    'STADE9',
    'STADE10',
    'STADE11',
    'STADE12',
    'STADE13',
    'STADE14',
    'STADE15'
  ],
  {
    error: () => 'Veuillez renseigner le stade de prélèvement.'
  }
);

export type Stage = z.infer<typeof Stage>;

export const StageList = Stage.options;

export const StageLabels: Record<Stage, string> = {
  STADE1: 'Végétal au stade récolte',
  STADE2: 'Végétal en cours de culture (avant récolte)',
  STADE3: 'Végétal au stockage',
  STADE4: 'Aliment pour animaux',
  STADE5: 'Eau',
  STADE6: 'Intrant (spécialité commerciale ou bouillie)',
  STADE7: 'Produit végétal transformé',
  STADE8: 'Substrat',
  STADE9: 'Autre',
  STADE10: 'Abattoir',
  STADE11: 'Elevage pondeuse',
  STADE12: "Centre d'emballage",
  STADE13: 'Biologique',
  STADE14: 'Standard',
  STADE15: 'Autre signe de qualité'
};

export const StagesByProgrammingPlanKind: Record<ProgrammingPlanKind, Stage[]> =
  {
    [ProgrammingPlanKind.enum.PPV]: [
      'STADE1',
      'STADE2',
      'STADE3',
      'STADE4',
      'STADE5',
      'STADE6',
      'STADE7',
      'STADE8',
      'STADE9'
    ],
    [ProgrammingPlanKind.enum.PFAS_MEAT]: ['STADE10', 'STADE11', 'STADE12'],
    [ProgrammingPlanKind.enum.PFAS_EGGS]: ['STADE10', 'STADE11', 'STADE12'],
    [ProgrammingPlanKind.enum.DAOA_BREEDING]: ['STADE13', 'STADE14', 'STADE15'],
    [ProgrammingPlanKind.enum.DAOA_SLAUGHTER]: ['STADE13', 'STADE14', 'STADE15']
  };
