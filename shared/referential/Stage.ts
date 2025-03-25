import { z } from 'zod';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { PartialSample } from '../schema/Sample/Sample';

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
    'STADE12'
  ],
  {
    errorMap: () => ({
      message: 'Veuillez renseigner le stade de prélèvement.'
    })
  }
);

export type Stage = z.infer<typeof Stage>;

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
  STADE12: "Centre d'emballage"
};

export const getStageLabel = (partialSample: PartialSample) =>
  partialSample.specificData?.programmingPlanKind === 'PPV' &&
  partialSample.specificData.stage
    ? StageLabels[partialSample.specificData.stage]
    : undefined;

export const StagesByProgrammingPlanKind: Record<ProgrammingPlanKind, Stage[]> =
  {
    [ProgrammingPlanKind.Values.PPV]: [
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
    [ProgrammingPlanKind.Values.PFAS_MEAT]: ['STADE10'],
    [ProgrammingPlanKind.Values.PFAS_EGGS]: ['STADE11', 'STADE12']
  };
