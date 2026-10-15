import {
  emptyProgrammingPlanSettings,
  managedKey,
  ProgrammingPlanSettingKey
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import { describe, expect, test } from 'vitest';
import {
  newSubPlanNumber,
  newSubPlanSettings
} from './programmingSubPlanCreationService';

describe('newSubPlanSettings', () => {
  test('should leave every setting empty', () => {
    const settings = newSubPlanSettings({
      ...emptyProgrammingPlanSettings(true),
      stages: ['PRODUCTION_PRIMAIRE_VEGETALE']
    });

    for (const settingKey of ProgrammingPlanSettingKey.options) {
      expect(settings[settingKey]).toBeNull();
    }
  });

  test('should manage the settings the plan does not manage', () => {
    const settings = newSubPlanSettings({
      ...emptyProgrammingPlanSettings(false),
      stagesManaged: true,
      notesManaged: true
    });

    for (const settingKey of ProgrammingPlanSettingKey.options) {
      expect(settings[managedKey(settingKey)]).toBe(
        !['stages', 'notes'].includes(settingKey)
      );
    }
  });
});

describe('newSubPlanNumber', () => {
  test('should number the first sub-plan of a plan', () => {
    expect(newSubPlanNumber([])).toBe('01');
  });

  test('should take the number following the greatest one', () => {
    expect(newSubPlanNumber(['M02', 'M01'])).toBe('M03');
  });

  test('should keep the PPV prefix', () => {
    expect(newSubPlanNumber(['PPV01', 'PPV02'])).toBe('PPV03');
  });

  test('should follow the greatest PPV number when the plan mixes prefixes', () => {
    expect(newSubPlanNumber(['PPV01', 'PPV07', 'Z01'])).toBe('PPV08');
  });
});
