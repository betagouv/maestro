import { describe, expect, test } from 'vitest';
import { inheritsUnmanagedSetting } from './ProgrammingPlanSettings';

describe('ProgrammingPlanSettings', () => {
  describe('inheritsUnmanagedSetting', () => {
    const settings = (stagesManaged: boolean) => ({
      stages: null,
      stagesManaged
    });

    test('should reject a sub-plan inheriting a setting its plan does not manage', () => {
      expect(inheritsUnmanagedSetting(settings(false), settings(false))).toBe(
        true
      );
    });

    test('should accept a sub-plan inheriting a setting its plan manages', () => {
      expect(inheritsUnmanagedSetting(settings(false), settings(true))).toBe(
        false
      );
    });

    test('should accept a sub-plan managing the setting itself, whatever the plan does', () => {
      expect(inheritsUnmanagedSetting(settings(true), settings(false))).toBe(
        false
      );
      expect(inheritsUnmanagedSetting(settings(true), settings(true))).toBe(
        false
      );
    });
  });
});
