import { describe, expect, test } from 'vitest';
import {
  ProgrammingPlanSettingsForm,
  ProgrammingSubPlanSettingsForm
} from './ProgrammingPlanSettingsForm';

describe('ProgrammingPlanSettingsForm', () => {
  describe.each([
    ['plan', ProgrammingPlanSettingsForm],
    ['sub-plan', ProgrammingSubPlanSettingsForm]
  ])('%s level', (_, schema) => {
    const form = (settings: {
      stages: string[] | null;
      stagesManaged: boolean;
      settingsCompleted: boolean;
    }) => schema.safeParse({ ...settings, fields: [] });

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
});
