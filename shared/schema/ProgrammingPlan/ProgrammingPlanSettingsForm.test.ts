import { describe, expect, test } from 'vitest';
import {
  NationalCoordinatorEmail,
  NationalCoordinatorId,
  NationalCoordinatorName
} from '../../test/programmingPlanFixtures';
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
  };
} = {
  stages: {
    value: ['TRANSFORMATION'],
    message: 'Veuillez renseigner au moins un stade de prélèvement.'
  },
  substanceKinds: {
    value: ['Mono'],
    message: 'Veuillez renseigner au moins un analyte.'
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
      const { value, message } = completedSettings[settingKey];

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
