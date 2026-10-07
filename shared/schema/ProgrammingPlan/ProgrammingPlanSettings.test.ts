import { describe, expect, test } from 'vitest';
import { defaultProgrammingPlanSample } from './ProgrammingPlanSampleSetting';
import {
  emptyProgrammingPlanSettings,
  inheritsUnmanagedSetting,
  managedKey,
  managesAboveSubstanceKinds,
  ProgrammingPlanSettingKey,
  type ProgrammingPlanSettings,
  pickProgrammingPlanSettings,
  SubstanceKindsDependentSettingKey,
  withSettingsBelowSubstanceKinds
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

  describe.each(SubstanceKindsDependentSettingKey.options)(
    'managesAboveSubstanceKinds on %s',
    (settingKey) => {
      const settings = (
        base: ProgrammingPlanSettings,
        managed: boolean,
        substanceKindsManaged: boolean
      ) => ({
        ...base,
        [managedKey(settingKey)]: managed,
        substanceKindsManaged
      });

      test.each([
        [false, false, false],
        [false, true, false],
        [true, true, false],
        [true, false, true]
      ])(
        'plan managing it: %s, analytes: %s => %s',
        (managed, substanceKindsManaged, expected) => {
          expect(
            managesAboveSubstanceKinds.plan(
              settings(
                emptyProgrammingPlanSettings(false),
                managed,
                substanceKindsManaged
              )
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
        'sub-plan managing it: %s, analytes: %s => %s',
        (managed, substanceKindsManaged, expected) => {
          expect(
            managesAboveSubstanceKinds.subPlan(
              settings(
                emptyProgrammingPlanSettings(true),
                managed,
                substanceKindsManaged
              )
            )
          ).toBe(expected);
        }
      );
    }
  );

  describe('withSettingsBelowSubstanceKinds', () => {
    const planSamples = [
      { ...defaultProgrammingPlanSample, substanceKinds: ['Mono' as const] }
    ];
    const planSubstances = { Mono: ['RF-1020-001-PPP'] };

    test('should stop a plan managing the settings depending on the analytes once it stops managing the analytes', () => {
      expect(
        withSettingsBelowSubstanceKinds(
          {
            ...emptyProgrammingPlanSettings(false),
            samples: planSamples,
            samplesManaged: true,
            substances: planSubstances,
            substancesManaged: true
          },
          undefined
        )
      ).toStrictEqual({
        ...emptyProgrammingPlanSettings(false),
        samples: planSamples,
        substances: planSubstances
      });
    });

    test('should detach the settings depending on the analytes of a sub-plan detaching its analytes, with the plan values', () => {
      expect(
        withSettingsBelowSubstanceKinds(
          {
            ...emptyProgrammingPlanSettings(false),
            substanceKindsManaged: true
          },
          {
            ...emptyProgrammingPlanSettings(true),
            samples: planSamples,
            substances: planSubstances
          }
        )
      ).toStrictEqual({
        ...emptyProgrammingPlanSettings(false),
        substanceKindsManaged: true,
        samples: planSamples,
        samplesManaged: true,
        substances: planSubstances,
        substancesManaged: true
      });
    });

    test('should keep the own value of a setting the sub-plan already manages', () => {
      const ownSubstances = { Multi: ['RF-0440-001-PPP'] };

      expect(
        withSettingsBelowSubstanceKinds(
          {
            ...emptyProgrammingPlanSettings(false),
            substanceKindsManaged: true,
            substances: ownSubstances,
            substancesManaged: true
          },
          {
            ...emptyProgrammingPlanSettings(true),
            samples: planSamples,
            substances: planSubstances
          }
        )
      ).toMatchObject({
        samples: planSamples,
        samplesManaged: true,
        substances: ownSubstances,
        substancesManaged: true
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
        expect(withSettingsBelowSubstanceKinds(settings, planSettings)).toBe(
          settings
        );
      }
    );
  });
});
