import { describe, expect, test } from 'vitest';
import { defaultProgrammingPlanSample } from './ProgrammingPlanSampleSetting';
import {
  emptyProgrammingPlanSettings,
  inheritsUnmanagedSetting,
  managedKey,
  managesSamplesAboveSubstanceKinds,
  ProgrammingPlanSettingKey,
  pickProgrammingPlanSettings,
  withSamplesBelowSubstanceKinds
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

  describe('managesSamplesAboveSubstanceKinds', () => {
    const settings = (
      samplesManaged: boolean,
      substanceKindsManaged: boolean
    ) => ({
      ...emptyProgrammingPlanSettings(false),
      samplesManaged,
      substanceKindsManaged
    });

    test.each([
      [false, false, false],
      [false, true, false],
      [true, true, false],
      [true, false, true]
    ])(
      'plan managing samples: %s, analytes: %s => %s',
      (samplesManaged, substanceKindsManaged, expected) => {
        expect(
          managesSamplesAboveSubstanceKinds.plan(
            settings(samplesManaged, substanceKindsManaged)
          )
        ).toBe(expected);
      }
    );

    test.each([
      [false, false, false],
      [true, false, false],
      [true, true, false],
      [false, true, true]
    ])(
      'sub-plan managing samples: %s, analytes: %s => %s',
      (samplesManaged, substanceKindsManaged, expected) => {
        expect(
          managesSamplesAboveSubstanceKinds.subPlan(
            settings(samplesManaged, substanceKindsManaged)
          )
        ).toBe(expected);
      }
    );
  });

  describe('withSamplesBelowSubstanceKinds', () => {
    const planSamples = [
      { ...defaultProgrammingPlanSample, substanceKinds: ['Mono' as const] }
    ];

    test('should stop a plan managing the samples once it stops managing the analytes', () => {
      expect(
        withSamplesBelowSubstanceKinds(
          {
            ...emptyProgrammingPlanSettings(false),
            samples: planSamples,
            samplesManaged: true
          },
          undefined
        )
      ).toStrictEqual({
        ...emptyProgrammingPlanSettings(false),
        samples: planSamples
      });
    });

    test('should detach the samples of a sub-plan detaching its analytes, with the plan configuration', () => {
      expect(
        withSamplesBelowSubstanceKinds(
          {
            ...emptyProgrammingPlanSettings(false),
            substanceKindsManaged: true
          },
          {
            ...emptyProgrammingPlanSettings(true),
            samples: planSamples
          }
        )
      ).toStrictEqual({
        ...emptyProgrammingPlanSettings(false),
        substanceKindsManaged: true,
        samples: planSamples,
        samplesManaged: true
      });
    });

    test.each([
      ['plan', emptyProgrammingPlanSettings(true), undefined],
      [
        'sub-plan',
        {
          ...emptyProgrammingPlanSettings(false),
          samples: planSamples,
          samplesManaged: true
        },
        emptyProgrammingPlanSettings(true)
      ]
    ])(
      'should leave coherent %s settings untouched',
      (_, settings, planSettings) => {
        expect(withSamplesBelowSubstanceKinds(settings, planSettings)).toBe(
          settings
        );
      }
    );
  });
});
