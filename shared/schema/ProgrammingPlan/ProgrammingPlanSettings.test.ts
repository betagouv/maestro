import { describe, expect, test } from 'vitest';
import {
  emptyProgrammingPlanSettings,
  inheritsUnmanagedSetting,
  managedKey,
  ProgrammingPlanSettingKey,
  pickProgrammingPlanSettings
} from './ProgrammingPlanSettings';

describe('ProgrammingPlanSettings', () => {
  describe.each(ProgrammingPlanSettingKey.options)(
    'inheritsUnmanagedSetting on %s',
    (settingKey) => {
      const managedSettings = emptyProgrammingPlanSettings(true);
      const unmanagedSettings = {
        ...managedSettings,
        [managedKey(settingKey)]: false
      };

      test('should reject a sub-plan inheriting a setting its plan does not manage', () => {
        expect(
          inheritsUnmanagedSetting(unmanagedSettings, unmanagedSettings)
        ).toBe(true);
      });

      test('should accept a sub-plan inheriting a setting its plan manages', () => {
        expect(
          inheritsUnmanagedSetting(unmanagedSettings, managedSettings)
        ).toBe(false);
      });

      test('should accept a sub-plan managing the setting itself, whatever the plan does', () => {
        expect(
          inheritsUnmanagedSetting(managedSettings, unmanagedSettings)
        ).toBe(false);
        expect(inheritsUnmanagedSetting(managedSettings, managedSettings)).toBe(
          false
        );
      });
    }
  );

  describe('emptyProgrammingPlanSettings', () => {
    test('should leave every setting empty with the given switch', () => {
      expect(emptyProgrammingPlanSettings(true)).toStrictEqual(
        Object.fromEntries(
          ProgrammingPlanSettingKey.options.flatMap((settingKey) => [
            [settingKey, null],
            [managedKey(settingKey), true]
          ])
        )
      );
    });
  });

  describe('pickProgrammingPlanSettings', () => {
    test('should keep the settings and drop every other key', () => {
      const settings = emptyProgrammingPlanSettings(false);
      const settingsForm = { ...settings, settingsCompleted: true, fields: [] };

      expect(pickProgrammingPlanSettings(settingsForm)).toStrictEqual(settings);
    });
  });
});
