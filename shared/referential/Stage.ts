import { z } from 'zod';

export const Stage = z.enum(
  [
    'PRODUCTION_PRIMAIRE_VEGETALE',
    'ALIMENTATION_ANIMALE',
    'ELEVAGE',
    'ABATTAGE',
    'TRANSFORMATION',
    'MISE_SUR_LE_MARCHE'
  ],
  {
    error: () => 'Veuillez renseigner le stade de prélèvement.'
  }
);

export type Stage = z.infer<typeof Stage>;

export const StageList = Stage.options;

export const SlaughterhouseStage = 'ABATTAGE' satisfies Stage;

export const StageLabels: Record<Stage, string> = {
  PRODUCTION_PRIMAIRE_VEGETALE: 'Production primaire végétale',
  ALIMENTATION_ANIMALE: 'Alimentation animale',
  ELEVAGE: 'Élevage',
  ABATTAGE: 'Abattage',
  TRANSFORMATION: 'Transformation',
  MISE_SUR_LE_MARCHE: 'Mise sur le marché'
};
