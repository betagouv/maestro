import { describe, expect, test } from 'vitest';
import {
  completedSubPlanSettingIssues,
  effectiveSubPlanSettings,
  planSaveConflicts,
  subPlanSettingsAfterPlanSave
} from './completedSubPlanSettings';
import {
  defaultProgrammingPlanSample,
  type ProgrammingPlanSampleSetting
} from './ProgrammingPlanSampleSetting';
import {
  emptyProgrammingPlanSettings,
  type ProgrammingPlanSettings
} from './ProgrammingPlanSettings';

const sample = (
  ...substanceKinds: ProgrammingPlanSampleSetting['substanceKinds']
): ProgrammingPlanSampleSetting => ({
  ...defaultProgrammingPlanSample,
  substanceKinds
});

const planSettings: ProgrammingPlanSettings = {
  stages: ['TRANSFORMATION'],
  stagesManaged: true,
  substanceKinds: ['Mono', 'Multi'],
  substanceKindsManaged: true,
  samples: [sample('Mono', 'Multi')],
  samplesManaged: true
};

const inheritingSubPlan = {
  ...planSettings,
  stagesManaged: false,
  substanceKindsManaged: false,
  samplesManaged: false,
  subPlanNumber: 'M01',
  settingsCompleted: true
};

const ownSubPlan = {
  stages: ['PRODUCTION_PRIMAIRE_VEGETALE' as const],
  stagesManaged: true,
  substanceKinds: ['Copper' as const],
  substanceKindsManaged: true,
  samples: [sample('Copper')],
  samplesManaged: true,
  subPlanNumber: 'M02',
  settingsCompleted: true
};

describe('effectiveSubPlanSettings', () => {
  test('prend la valeur du plan pour un paramètre hérité', () => {
    expect(
      effectiveSubPlanSettings(
        { ...ownSubPlan, stagesManaged: false },
        planSettings
      )
    ).toMatchObject({
      stages: ['TRANSFORMATION'],
      substanceKinds: ['Copper'],
      samples: [sample('Copper')]
    });
  });
});

describe('subPlanSettingsAfterPlanSave', () => {
  const unmanagedPlan = emptyProgrammingPlanSettings(false);

  test('fait hériter les sous-plans d’un paramètre que le plan reprend', () => {
    expect(
      subPlanSettingsAfterPlanSave(ownSubPlan, unmanagedPlan, {
        ...unmanagedPlan,
        stagesManaged: true
      })
    ).toMatchObject({ stagesManaged: false });
  });

  test('laisse ses échantillons à un sous-plan qui gère ses analytes', () => {
    expect(
      subPlanSettingsAfterPlanSave(ownSubPlan, unmanagedPlan, {
        ...unmanagedPlan,
        samplesManaged: true
      })
    ).toMatchObject({ samplesManaged: true });
  });

  test('recopie la valeur du plan dans les sous-plans qui en héritaient quand le plan la rend', () => {
    expect(
      subPlanSettingsAfterPlanSave(inheritingSubPlan, planSettings, {
        ...planSettings,
        stages: ['ALIMENTATION_ANIMALE'],
        stagesManaged: false
      })
    ).toMatchObject({ stages: ['ALIMENTATION_ANIMALE'], stagesManaged: true });
  });

  test('ne change rien quand le plan garde la même gestion', () => {
    expect(
      subPlanSettingsAfterPlanSave(inheritingSubPlan, planSettings, {
        ...planSettings,
        stages: []
      })
    ).toStrictEqual(inheritingSubPlan);
  });
});

describe('completedSubPlanSettingIssues', () => {
  test('accepte des paramètres renseignés et cohérents', () => {
    expect(completedSubPlanSettingIssues(planSettings)).toStrictEqual([]);
  });

  test('signale chaque paramètre vide', () => {
    expect(
      completedSubPlanSettingIssues({
        ...planSettings,
        stages: [],
        samples: null
      })
    ).toStrictEqual([
      { settingKey: 'stages', reason: 'missing' },
      { settingKey: 'samples', reason: 'missing' }
    ]);
  });

  test('impute l’incohérence aux analytes quand le sous-plan gère ses échantillons', () => {
    expect(
      completedSubPlanSettingIssues({
        ...planSettings,
        substanceKinds: ['Mono', 'Multi', 'Copper']
      })
    ).toStrictEqual([{ settingKey: 'substanceKinds', reason: 'incoherent' }]);
  });

  test('impute l’incohérence aux échantillons quand le sous-plan en hérite', () => {
    expect(
      completedSubPlanSettingIssues({
        ...planSettings,
        samples: [sample('Mono')],
        samplesManaged: false
      })
    ).toStrictEqual([{ settingKey: 'samples', reason: 'incoherent' }]);
  });
});

describe('planSaveConflicts', () => {
  test('refuse de vider un paramètre dont héritent des sous-plans terminés', () => {
    expect(
      planSaveConflicts(
        [
          inheritingSubPlan,
          { ...inheritingSubPlan, subPlanNumber: 'M03' },
          ownSubPlan
        ],
        planSettings,
        { ...planSettings, stages: [] }
      )
    ).toStrictEqual([
      {
        settingKey: 'stages',
        reason: 'missing',
        subPlanNumbers: ['M01', 'M03']
      }
    ]);
  });

  test('refuse de reprendre un paramètre vide géré par un sous-plan terminé', () => {
    const plan = { ...planSettings, stages: null, stagesManaged: false };

    expect(
      planSaveConflicts([ownSubPlan], plan, { ...plan, stagesManaged: true })
    ).toStrictEqual([
      { settingKey: 'stages', reason: 'missing', subPlanNumbers: ['M02'] }
    ]);
  });

  test('refuse de rendre un paramètre vide à des sous-plans terminés qui en héritaient', () => {
    expect(
      planSaveConflicts([inheritingSubPlan], planSettings, {
        ...planSettings,
        stages: null,
        stagesManaged: false
      })
    ).toStrictEqual([
      { settingKey: 'stages', reason: 'missing', subPlanNumbers: ['M01'] }
    ]);
  });

  test('refuse des analytes qui ne correspondent plus aux échantillons d’un sous-plan terminé', () => {
    const subPlan = {
      ...inheritingSubPlan,
      samplesManaged: true,
      samples: [sample('Mono'), sample('Multi')]
    };

    expect(
      planSaveConflicts([subPlan], planSettings, {
        ...planSettings,
        substanceKinds: ['Mono', 'Multi', 'Copper'],
        samples: [sample('Mono', 'Multi', 'Copper')]
      })
    ).toStrictEqual([
      {
        settingKey: 'substanceKinds',
        reason: 'incoherent',
        subPlanNumbers: ['M01']
      }
    ]);
  });

  test('ignore les sous-plans en brouillon', () => {
    expect(
      planSaveConflicts(
        [{ ...inheritingSubPlan, settingsCompleted: false }],
        planSettings,
        { ...planSettings, stages: [] }
      )
    ).toStrictEqual([]);
  });

  test('ne bloque pas le plan pour un problème qui existait déjà', () => {
    const incoherentSubPlan = {
      ...ownSubPlan,
      samples: [sample('Mono')]
    };

    expect(
      planSaveConflicts([incoherentSubPlan], planSettings, {
        ...planSettings,
        stages: ['ALIMENTATION_ANIMALE']
      })
    ).toStrictEqual([]);
  });
});
