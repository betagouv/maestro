import { describe, expect, test } from 'vitest';
import {
  genSubPlanMatrices,
  NationalCoordinatorEmail,
  NationalCoordinatorId,
  NationalCoordinatorName
} from '../../test/programmingPlanFixtures';
import type { SubstanceKind } from '../Substance/SubstanceKind';
import { defaultProgrammingPlanSample } from './ProgrammingPlanSampleSetting';
import {
  emptyProgrammingPlanSettings,
  managedKey,
  ProgrammingPlanSettingKey,
  ProgrammingPlanSettings
} from './ProgrammingPlanSettings';
import {
  ProgrammingLevelSettingsForm,
  ProgrammingPlanSettingsForm,
  ProgrammingSubPlanLevelSettingsForm,
  ProgrammingSubPlanSettingsForm
} from './ProgrammingPlanSettingsForm';

const matrices = genSubPlanMatrices('A00GY');

const completedSettings: {
  [K in ProgrammingPlanSettingKey]: {
    value: NonNullable<ProgrammingPlanSettings[K]>;
    message: string;
    context?: Partial<ProgrammingPlanSettings>;
  };
} = {
  stages: {
    value: ['TRANSFORMATION'],
    message: 'Veuillez renseigner au moins un stade de prélèvement.'
  },
  substanceKinds: {
    value: ['Mono'],
    message: 'Veuillez renseigner au moins un analyte.'
  },
  samples: {
    value: [{ ...defaultProgrammingPlanSample, substanceKinds: ['Mono'] }],
    message: 'Veuillez configurer au moins un échantillon.',
    context: { substanceKinds: ['Mono'] }
  },
  matrices: {
    value: matrices,
    message: 'Veuillez renseigner au moins une catégorie de matrice.'
  }
};

const inheritedSettings: ProgrammingPlanSettings = {
  ...emptyProgrammingPlanSettings(false),
  stages: completedSettings.stages.value,
  substanceKinds: completedSettings.substanceKinds.value,
  samples: completedSettings.samples.value,
  matrices: completedSettings.matrices.value
};

const nationalCoordinator = {
  id: NationalCoordinatorId,
  name: NationalCoordinatorName,
  email: NationalCoordinatorEmail
};

describe('ProgrammingPlanSettingsForm', () => {
  describe.each([
    [
      'plan',
      ProgrammingPlanSettingsForm,
      {
        nationalCoordinators: [nationalCoordinator],
        technicalInstruction: null
      },
      'plan'
    ],
    [
      'sub-plan',
      ProgrammingSubPlanSettingsForm,
      { context: 'Control' },
      'subPlan'
    ],
    [
      'plan form',
      ProgrammingLevelSettingsForm,
      {
        nationalCoordinators: null,
        technicalInstruction: null,
        context: null
      },
      'plan'
    ],
    [
      'sub-plan form',
      ProgrammingSubPlanLevelSettingsForm,
      {
        nationalCoordinators: null,
        technicalInstruction: null,
        context: 'Control'
      },
      'subPlan'
    ]
  ] as const)('%s level', (_, schema, levelSettings, level) => {
    const form = (
      settings: Record<string, unknown> & { settingsCompleted: boolean }
    ) =>
      schema.safeParse({
        ...inheritedSettings,
        ...settings,
        ...levelSettings,
        fields: []
      });

    describe.each(ProgrammingPlanSettingKey.options)('%s', (settingKey) => {
      const { value, message, context } = completedSettings[settingKey];
      const emptyValues = [null, []].filter(
        (emptyValue) =>
          ProgrammingPlanSettings.shape[settingKey].safeParse(emptyValue)
            .success
      );

      test.each(emptyValues)(
        'should accept a draft managing it with %j',
        (emptyValue) => {
          expect(
            form({
              [settingKey]: emptyValue,
              [managedKey(settingKey)]: true,
              settingsCompleted: false
            }).success
          ).toBe(true);
        }
      );

      test.each(emptyValues)(
        'should refuse to complete a level managing it with %j',
        (emptyValue) => {
          const result = form({
            [settingKey]: emptyValue,
            [managedKey(settingKey)]: true,
            settingsCompleted: true
          });

          expect(result.success).toBe(false);
          expect(result.error?.issues).toContainEqual(
            expect.objectContaining({ path: [settingKey], message })
          );
        }
      );

      test('should accept a completed level managing it', () => {
        expect(
          form({
            ...context,
            [settingKey]: value,
            [managedKey(settingKey)]: true,
            settingsCompleted: true
          }).success
        ).toBe(true);
      });

      test.runIf(level === 'plan')(
        'should accept a completed plan that does not manage it',
        () => {
          expect(
            form({
              [settingKey]: null,
              [managedKey(settingKey)]: false,
              settingsCompleted: true
            }).success
          ).toBe(true);
        }
      );

      test.runIf(level === 'subPlan')(
        'should refuse to complete a sub-plan inheriting it empty',
        () => {
          const result = form({
            [settingKey]: null,
            [managedKey(settingKey)]: false,
            settingsCompleted: true
          });

          expect(result.success).toBe(false);
          expect(result.error?.issues).toContainEqual(
            expect.objectContaining({
              path: [settingKey],
              message:
                'Ce paramètre est hérité du plan, qui ne l’a pas encore renseigné.'
            })
          );
        }
      );

      test.runIf(level === 'subPlan')(
        'should accept a completed sub-plan inheriting it filled',
        () => {
          expect(
            form({
              ...context,
              [settingKey]: value,
              [managedKey(settingKey)]: false,
              settingsCompleted: true
            }).success
          ).toBe(true);
        }
      );
    });
  });

  describe('samples covering the analytes', () => {
    const sample = (...substanceKinds: SubstanceKind[]) => ({
      ...defaultProgrammingPlanSample,
      substanceKinds
    });

    const form = (
      settings: Partial<ProgrammingPlanSettings> & {
        settingsCompleted: boolean;
      }
    ) =>
      ProgrammingSubPlanSettingsForm.safeParse({
        ...inheritedSettings,
        substanceKinds: ['Mono', 'Multi', 'Copper'],
        substanceKindsManaged: true,
        samplesManaged: true,
        context: 'Control',
        ...settings,
        fields: []
      });

    test('should accept a completed level whose samples hold every analyte exactly once', () => {
      expect(
        form({
          samples: [sample('Multi', 'Copper'), sample('Mono')],
          settingsCompleted: true
        }).success
      ).toBe(true);
    });

    test('should accept a draft whose samples do not cover the analytes', () => {
      expect(
        form({ samples: [sample()], settingsCompleted: false }).success
      ).toBe(true);
    });

    test('should refuse to complete a sub-plan inheriting samples that do not cover its analytes', () => {
      expect(
        form({
          samples: [sample()],
          samplesManaged: false,
          settingsCompleted: true
        }).success
      ).toBe(false);
    });

    test('should refuse to complete a sample without analyte', () => {
      const result = form({
        samples: [sample('Mono'), sample(), sample('Multi', 'Copper')],
        settingsCompleted: true
      });

      expect(result.error?.issues).toStrictEqual([
        expect.objectContaining({
          path: ['samples', 1, 'substanceKinds'],
          message: 'Veuillez choisir au moins un analyte pour l’échantillon 2.'
        })
      ]);
    });

    test('should refuse to complete a sample with an analyte outside the level', () => {
      const result = form({
        samples: [sample('Mono'), sample('Multi', 'Copper', 'Any')],
        settingsCompleted: true
      });

      expect(result.error?.issues).toStrictEqual([
        expect.objectContaining({
          path: ['samples', 1, 'substanceKinds'],
          message:
            'L’analyte « Mono-résidu et multi-résidus » de l’échantillon 2 ne fait pas partie des analytes.'
        })
      ]);
    });

    test('should refuse to complete a level with an analyte assigned to no sample', () => {
      const result = form({
        samples: [sample('Mono'), sample('Copper')],
        settingsCompleted: true
      });

      expect(result.error?.issues).toStrictEqual([
        expect.objectContaining({
          path: ['samples'],
          message:
            'L’analyte « Multi-résidus » n’est affecté à aucun échantillon.'
        })
      ]);
    });

    test('should refuse to complete a level with an analyte assigned to several samples', () => {
      const result = form({
        samples: [sample('Mono', 'Multi'), sample('Multi', 'Copper')],
        settingsCompleted: true
      });

      expect(result.error?.issues).toStrictEqual([
        expect.objectContaining({
          path: ['samples'],
          message:
            'L’analyte « Multi-résidus » est affecté à plusieurs échantillons.'
        })
      ]);
    });
  });

  describe('national coordinators', () => {
    const planForm = (
      nationalCoordinators: (typeof nationalCoordinator)[],
      settingsCompleted: boolean
    ) =>
      ProgrammingPlanSettingsForm.safeParse({
        ...emptyProgrammingPlanSettings(false),
        settingsCompleted,
        nationalCoordinators,
        technicalInstruction: null,
        fields: []
      });

    test('should accept a plan draft without any coordinator', () => {
      expect(planForm([], false).success).toBe(true);
    });

    test.fails('should refuse to complete a plan without any coordinator', () => {
      const result = planForm([], true);

      expect(result.success).toBe(false);
      expect(result.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['nationalCoordinators'],
          message: 'Veuillez renseigner au moins un coordinateur national.'
        })
      );
    });

    test('should accept a completed plan with a coordinator', () => {
      expect(planForm([nationalCoordinator], true).success).toBe(true);
    });

    test('should ignore the coordinators of a sub-plan', () => {
      const result = ProgrammingSubPlanSettingsForm.safeParse({
        ...inheritedSettings,
        settingsCompleted: true,
        nationalCoordinators: [],
        context: 'Control',
        fields: []
      });

      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('nationalCoordinators');
    });

    test('should accept a completed sub-plan level, which manages no coordinator', () => {
      expect(
        ProgrammingSubPlanLevelSettingsForm.safeParse({
          ...inheritedSettings,
          settingsCompleted: true,
          nationalCoordinators: null,
          technicalInstruction: null,
          context: 'Control',
          fields: []
        }).success
      ).toBe(true);
    });
  });

  describe('context', () => {
    const subPlanForm = (settings: {
      context: 'Control' | null;
      settingsCompleted: boolean;
    }) =>
      ProgrammingSubPlanSettingsForm.safeParse({
        ...inheritedSettings,
        ...settings,
        fields: []
      });

    test('should accept a sub-plan draft without context', () => {
      expect(
        subPlanForm({ context: null, settingsCompleted: false }).success
      ).toBe(true);
    });

    test('should refuse to complete a sub-plan without context', () => {
      const result = subPlanForm({ context: null, settingsCompleted: true });

      expect(result.error?.issues).toStrictEqual([
        expect.objectContaining({
          path: ['context'],
          message: 'Veuillez renseigner le contexte.'
        })
      ]);
    });

    test('should accept a completed sub-plan with a context', () => {
      expect(
        subPlanForm({ context: 'Control', settingsCompleted: true }).success
      ).toBe(true);
    });
  });
});
