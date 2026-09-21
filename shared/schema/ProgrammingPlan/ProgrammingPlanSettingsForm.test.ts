import { describe, expect, test } from 'vitest';
import {
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
  type ProgrammingPlanSettings
} from './ProgrammingPlanSettings';
import {
  ProgrammingLevelSettingsForm,
  ProgrammingPlanSettingsForm,
  ProgrammingSubPlanSettingsForm
} from './ProgrammingPlanSettingsForm';

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
  }
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
      { nationalCoordinators: [nationalCoordinator] }
    ],
    ['sub-plan', ProgrammingSubPlanSettingsForm, {}],
    ['level', ProgrammingLevelSettingsForm, { nationalCoordinators: null }]
  ])('%s level', (_, schema, levelSettings) => {
    const form = (
      settings: Record<string, unknown> & { settingsCompleted: boolean }
    ) =>
      schema.safeParse({
        ...emptyProgrammingPlanSettings(false),
        ...settings,
        ...levelSettings,
        fields: []
      });

    describe.each(ProgrammingPlanSettingKey.options)('%s', (settingKey) => {
      const { value, message, context } = completedSettings[settingKey];

      test.each([null, []])(
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

      test.each([null, []])(
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

      test('should accept a completed level that does not manage it', () => {
        expect(
          form({
            [settingKey]: null,
            [managedKey(settingKey)]: false,
            settingsCompleted: true
          }).success
        ).toBe(true);
      });
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
        ...emptyProgrammingPlanSettings(false),
        substanceKinds: ['Mono', 'Multi', 'Copper'],
        substanceKindsManaged: true,
        samplesManaged: true,
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

    test('should accept a completed level that does not manage the samples', () => {
      expect(
        form({
          samples: [sample()],
          samplesManaged: false,
          settingsCompleted: true
        }).success
      ).toBe(true);
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
        ...emptyProgrammingPlanSettings(false),
        settingsCompleted: true,
        nationalCoordinators: [],
        fields: []
      });

      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('nationalCoordinators');
    });

    test('should accept a completed sub-plan level, which manages no coordinator', () => {
      expect(
        ProgrammingLevelSettingsForm.safeParse({
          ...emptyProgrammingPlanSettings(false),
          settingsCompleted: true,
          nationalCoordinators: null,
          fields: []
        }).success
      ).toBe(true);
    });
  });
});
