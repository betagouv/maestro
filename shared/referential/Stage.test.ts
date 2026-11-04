import { describe, expect, test } from 'vitest';
import {
  StageList,
  StageSelection,
  SubPlanStages,
  SubStage,
  stageSelectionLabels,
  stagesOfSelection,
  subStagesOf
} from './Stage';

describe('Stage referential', () => {
  test('should derive the stages in their declaration order', () => {
    expect(StageList).toEqual([
      'PRODUCTION_PRIMAIRE_VEGETALE',
      'ALIMENTATION_ANIMALE',
      'ELEVAGE',
      'ABATTAGE',
      'TRANSFORMATION',
      'MISE_SUR_LE_MARCHE'
    ]);
  });

  test('should derive the sub-stages of every stage', () => {
    expect(subStagesOf('ALIMENTATION_ANIMALE')).toEqual([
      'AMONT_USINE',
      'AMONT_FOURNISSEUR'
    ]);
    expect(subStagesOf('TRANSFORMATION')).toEqual([
      'USINE_TRANSFORMATION',
      'ENTREPOT'
    ]);
    expect(subStagesOf('MISE_SUR_LE_MARCHE')).toEqual(['COMMERCE_GROS_DETAIL']);
    expect(subStagesOf('ABATTAGE')).toEqual([]);
    expect(SubStage.options).toHaveLength(5);
  });

  test('should reject a sub-stage of another stage', () => {
    expect(
      StageSelection.safeParse({ stage: 'ABATTAGE', subStages: ['ENTREPOT'] })
        .success
    ).toBe(false);
    expect(
      StageSelection.safeParse({
        stage: 'TRANSFORMATION',
        subStages: ['ENTREPOT']
      }).success
    ).toBe(true);
  });
});

describe('SubPlanStages', () => {
  test('should accept a mix of whole stages and sub-stages', () => {
    expect(
      SubPlanStages.safeParse([
        { stage: 'TRANSFORMATION', subStages: ['ENTREPOT'] },
        { stage: 'MISE_SUR_LE_MARCHE', subStages: [] }
      ]).success
    ).toBe(true);
  });

  test('should reject a stage selected twice', () => {
    expect(
      SubPlanStages.safeParse([
        { stage: 'TRANSFORMATION', subStages: ['ENTREPOT'] },
        { stage: 'TRANSFORMATION', subStages: [] }
      ]).error?.issues[0].message
    ).toBe('Un stade de prélèvement ne peut apparaître qu’une fois.');
  });

  test('should reject a sub-stage selected twice', () => {
    expect(
      SubPlanStages.safeParse([
        { stage: 'TRANSFORMATION', subStages: ['ENTREPOT', 'ENTREPOT'] }
      ]).error?.issues[0].message
    ).toBe('Un stade de niveau 2 ne peut apparaître qu’une fois.');
  });
});

describe('stage selection helpers', () => {
  test('should list the first level stages', () => {
    expect(
      stagesOfSelection([
        { stage: 'TRANSFORMATION', subStages: ['ENTREPOT'] },
        { stage: 'ABATTAGE', subStages: [] }
      ])
    ).toEqual(['TRANSFORMATION', 'ABATTAGE']);
    expect(stagesOfSelection(null)).toEqual([]);
  });

  test('should label a whole stage and its sub-stages', () => {
    expect(
      stageSelectionLabels([
        {
          stage: 'ALIMENTATION_ANIMALE',
          subStages: ['AMONT_USINE', 'AMONT_FOURNISSEUR']
        },
        { stage: 'MISE_SUR_LE_MARCHE', subStages: [] }
      ])
    ).toEqual([
      'Alimentation animale (Amont / Usine, Amont / Fournisseur)',
      'Mise sur le marché'
    ]);
    expect(stageSelectionLabels(null)).toEqual([]);
  });
});
