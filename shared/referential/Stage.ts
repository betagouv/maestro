import { uniq, uniqBy } from 'lodash-es';
import { z } from 'zod';
import { refineSchema } from '../utils/zod';

export const StageSelection = z.discriminatedUnion('stage', [
  z.object({
    stage: z.literal('PRODUCTION_PRIMAIRE_VEGETALE'),
    subStages: z.array(z.enum([]))
  }),
  z.object({
    stage: z.literal('ALIMENTATION_ANIMALE'),
    subStages: z.array(z.enum(['AMONT_USINE', 'AMONT_FOURNISSEUR']))
  }),
  z.object({
    stage: z.literal('ELEVAGE'),
    subStages: z.array(z.enum([]))
  }),
  z.object({
    stage: z.literal('ABATTAGE'),
    subStages: z.array(z.enum([]))
  }),
  z.object({
    stage: z.literal('TRANSFORMATION'),
    subStages: z.array(z.enum(['USINE_TRANSFORMATION', 'ENTREPOT']))
  }),
  z.object({
    stage: z.literal('MISE_SUR_LE_MARCHE'),
    subStages: z.array(z.enum(['COMMERCE_GROS_DETAIL']))
  })
]);

export type StageSelection = z.infer<typeof StageSelection>;

export const Stage = z.enum(
  StageSelection.options.map((option) => option.shape.stage.value),
  {
    error: () => 'Veuillez renseigner le stade de prélèvement.'
  }
);

export type Stage = z.infer<typeof Stage>;

export const StageList = Stage.options;

export const SubStage = z.enum(
  StageSelection.options.flatMap(
    (option) => option.shape.subStages.element.options
  )
);

export type SubStage = z.infer<typeof SubStage>;

export const subStagesOf = (stage: Stage): SubStage[] =>
  StageSelection.options.find((option) => option.shape.stage.value === stage)
    ?.shape.subStages.element.options ?? [];

export const SubPlanStages = refineSchema(
  refineSchema(
    z.array(StageSelection),
    (items) => uniqBy(items, 'stage').length === items.length,
    'Un stade de prélèvement ne peut apparaître qu’une fois.'
  ),
  (items) =>
    items.every(
      ({ subStages }) => uniq<SubStage>(subStages).length === subStages.length
    ),
  'Un stade de niveau 2 ne peut apparaître qu’une fois.'
);

export type SubPlanStages = z.infer<typeof SubPlanStages>;

export const SlaughterhouseStage = 'ABATTAGE' satisfies Stage;

export const StageLabels: Record<Stage, string> = {
  PRODUCTION_PRIMAIRE_VEGETALE: 'Production primaire végétale',
  ALIMENTATION_ANIMALE: 'Alimentation animale',
  ELEVAGE: 'Élevage',
  ABATTAGE: 'Abattage',
  TRANSFORMATION: 'Transformation',
  MISE_SUR_LE_MARCHE: 'Mise sur le marché'
};

export const SubStageLabels: Record<SubStage, string> = {
  AMONT_USINE: 'Amont / Usine',
  AMONT_FOURNISSEUR: 'Amont / Fournisseur',
  USINE_TRANSFORMATION: 'Usine de transformation',
  ENTREPOT: 'Entrepôt',
  COMMERCE_GROS_DETAIL: 'Commerce de gros ou de détail'
};

export const stagesOfSelection = (stages: SubPlanStages | null): Stage[] =>
  (stages ?? []).map(({ stage }) => stage);

export const stageSelectionLabels = (stages: SubPlanStages | null): string[] =>
  (stages ?? []).map(({ stage, subStages }) =>
    subStages.length === 0
      ? StageLabels[stage]
      : `${StageLabels[stage]} (${subStages
          .map((subStage) => SubStageLabels[subStage])
          .join(', ')})`
  );
