import { describe, expect, test } from 'vitest';
import {
  NationalCoordinatorId,
  NationalCoordinatorName
} from '../../test/programmingPlanFixtures';
import {
  ProgrammingLevelSettingsForm,
  ProgrammingPlanSettingsForm,
  ProgrammingSubPlanSettingsForm
} from './ProgrammingPlanSettingsForm';

const nationalCoordinator = {
  id: NationalCoordinatorId,
  name: NationalCoordinatorName
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
    const form = (settings: {
      stages: string[] | null;
      stagesManaged: boolean;
      settingsCompleted: boolean;
    }) => schema.safeParse({ ...settings, ...levelSettings, fields: [] });

    test('should accept a draft missing its required settings', () => {
      expect(
        form({
          stages: null,
          stagesManaged: true,
          settingsCompleted: false
        }).success
      ).toBe(true);
      expect(
        form({ stages: [], stagesManaged: true, settingsCompleted: false })
          .success
      ).toBe(true);
    });

    test('should refuse to complete a level managing stages without any', () => {
      const result = form({
        stages: null,
        stagesManaged: true,
        settingsCompleted: true
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['stages'],
          message: 'Veuillez renseigner au moins un stade de prélèvement.'
        })
      );
    });

    test('should accept a completed level managing stages', () => {
      expect(
        form({
          stages: ['TRANSFORMATION'],
          stagesManaged: true,
          settingsCompleted: true
        }).success
      ).toBe(true);
    });

    test('should accept a completed level that does not manage stages', () => {
      expect(
        form({ stages: null, stagesManaged: false, settingsCompleted: true })
          .success
      ).toBe(true);
    });
  });

  describe('national coordinators', () => {
    const planForm = (
      nationalCoordinators: (typeof nationalCoordinator)[],
      settingsCompleted: boolean
    ) =>
      ProgrammingPlanSettingsForm.safeParse({
        stages: null,
        stagesManaged: false,
        settingsCompleted,
        nationalCoordinators,
        fields: []
      });

    test('should accept a plan draft without any coordinator', () => {
      expect(planForm([], false).success).toBe(true);
    });

    test('should refuse to complete a plan without any coordinator', () => {
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
        stages: null,
        stagesManaged: false,
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
          stages: null,
          stagesManaged: false,
          settingsCompleted: true,
          nationalCoordinators: null,
          fields: []
        }).success
      ).toBe(true);
    });
  });
});
