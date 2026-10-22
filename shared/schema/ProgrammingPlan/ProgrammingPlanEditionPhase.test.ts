import { describe, expect, test } from 'vitest';
import {
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from '../SpecificData/ProgrammingSubPlanFieldConfig';
import {
  lockedFieldsChanged,
  lockedSettingKeys,
  lockedSettingsChanged,
  ProgrammingPlanEditionPhase,
  programmingPlanEditionPhase
} from './ProgrammingPlanEditionPhase';
import {
  emptyProgrammingPlanSettings,
  managedKey,
  type ProgrammingPlanSettings
} from './ProgrammingPlanSettings';
import { ProgrammingPlanStatusList } from './ProgrammingPlanStatus';

const storedSettings: ProgrammingPlanSettings = {
  ...emptyProgrammingPlanSettings(true),
  stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
  substanceKinds: ['Mono'],
  context: 'Control',
  notes: 'Note',
  monoSubstances: ['RF-1020-001-PPP']
};

const fieldA = {
  fieldId: SpecificDataFieldId.parse('11111111-1111-1111-1111-111111111111'),
  required: true,
  optionIds: []
};
const fieldB = {
  fieldId: SpecificDataFieldId.parse('22222222-2222-2222-2222-222222222222'),
  required: false,
  optionIds: []
};

describe('ProgrammingPlanEditionPhase', () => {
  describe('programmingPlanEditionPhase', () => {
    test.each(ProgrammingPlanStatusList)(
      'should derive the phase from the national status %s',
      (status) => {
        expect(
          programmingPlanEditionPhase({
            launchedAt: null,
            nationalStatus: { status }
          })
        ).toBe(
          ['InProgress', 'SubmittedToAdmin'].includes(status)
            ? 'Draft'
            : 'Submitted'
        );
      }
    );

    test('should be launched once the campaign has been launched', () => {
      expect(
        programmingPlanEditionPhase({
          launchedAt: new Date('2026-03-01'),
          nationalStatus: { status: 'Validated' }
        })
      ).toBe('Launched');
    });
  });

  describe.each(ProgrammingPlanEditionPhase.options)(
    'lockedSettingsChanged in %s phase',
    (phase) => {
      test('should accept an unchanged body', () => {
        expect(
          lockedSettingsChanged(phase, storedSettings, storedSettings)
        ).toBe(false);
      });

      test('should always accept a change of the notes', () => {
        expect(
          lockedSettingsChanged(phase, storedSettings, {
            ...storedSettings,
            notes: 'Autre note',
            notesManaged: false
          })
        ).toBe(false);
      });

      test.each(lockedSettingKeys[phase])(
        'should reject a change of the locked %s value or switch',
        (settingKey) => {
          expect(
            lockedSettingsChanged(phase, storedSettings, {
              ...storedSettings,
              [settingKey]: null
            })
          ).toBe(storedSettings[settingKey] !== null);
          expect(
            lockedSettingsChanged(phase, storedSettings, {
              ...storedSettings,
              [managedKey(settingKey)]: false
            })
          ).toBe(true);
        }
      );
    }
  );

  test('should ignore the value of a locked setting not managed at this level', () => {
    const unmanaged = { ...storedSettings, stagesManaged: false };
    expect(
      lockedSettingsChanged('Launched', unmanaged, {
        ...unmanaged,
        stages: ['ABATTAGE']
      })
    ).toBe(false);
  });

  describe('lockedFieldsChanged', () => {
    test.each(['Draft', 'Submitted'] as const)(
      'should accept any change in %s phase',
      (phase) => {
        expect(lockedFieldsChanged(phase, [fieldA, fieldB], [fieldA])).toBe(
          false
        );
      }
    );

    test('should accept a reordering once the campaign is launched', () => {
      expect(
        lockedFieldsChanged('Launched', [fieldA, fieldB], [fieldB, fieldA])
      ).toBe(false);
    });

    test.each([
      { change: 'an added field', body: [fieldA, fieldB] },
      { change: 'a removed field', body: [] },
      { change: 'a required change', body: [{ ...fieldA, required: false }] },
      {
        change: 'an option change',
        body: [
          {
            ...fieldA,
            optionIds: [
              SpecificDataFieldOptionId.parse(
                '33333333-3333-3333-3333-333333333333'
              )
            ]
          }
        ]
      },
      {
        change: 'an inheritance change',
        body: [{ ...fieldA, inheritance: 'Excluded' as const }]
      }
    ])('should reject $change once the campaign is launched', ({ body }) => {
      expect(lockedFieldsChanged('Launched', [fieldA], body)).toBe(true);
    });
  });
});
