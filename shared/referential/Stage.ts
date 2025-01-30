import { z } from 'zod';

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
    'STADE9'
  ],
  {
    errorMap: () => ({
      message: 'Veuillez renseigner le stade de prélèvement.'
    })
  }
);

export type Stage = z.infer<typeof Stage>;

export const StageList: Stage[] = Stage.options;

export const StageLabels: Record<Stage, string> = {
  STADE1: 'Végétal au stade récolte',
  STADE2: 'Végétal en cours de culture (avant récolte)',
  STADE3: 'Végétal au stockage',
  STADE4: 'Aliment pour animaux',
  STADE5: 'Eau',
  STADE6: 'Intrant (spécialité commerciale ou bouillie)',
  STADE7: 'Produit végétal transformé',
  STADE8: 'Substrat',
  STADE9: 'Autre'
};
