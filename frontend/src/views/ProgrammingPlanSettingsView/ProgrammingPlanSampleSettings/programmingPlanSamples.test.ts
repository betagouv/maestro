import {
  defaultProgrammingPlanSample,
  ProgrammingPlanSampleMaxCount,
  type ProgrammingPlanSampleSetting
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import { describe, expect, test } from 'vitest';
import {
  addProgrammingPlanSample,
  toggleSampleSubstanceKind,
  unassignedSubstanceKinds
} from './programmingPlanSamples';

describe('addProgrammingPlanSample', () => {
  test('should add a default sample to an empty configuration', () => {
    expect(addProgrammingPlanSample([])).toStrictEqual([
      defaultProgrammingPlanSample
    ]);
  });

  test('should add a sample without analyte, with the copies of the last sample', () => {
    const [laboratoryCopy] = defaultProgrammingPlanSample.copies;
    const lastSample: ProgrammingPlanSampleSetting = {
      substanceKinds: ['Multi', 'Copper'],
      copies: [
        laboratoryCopy,
        { required: true, recipientKinds: ['Laboratory'] },
        { required: false, recipientKinds: ['Operator'] }
      ]
    };

    expect(
      addProgrammingPlanSample([
        { ...defaultProgrammingPlanSample, substanceKinds: ['Mono'] },
        lastSample
      ])
    ).toStrictEqual([
      { ...defaultProgrammingPlanSample, substanceKinds: ['Mono'] },
      lastSample,
      { substanceKinds: [], copies: lastSample.copies }
    ]);
  });

  test('should not add a sample beyond the maximum', () => {
    const samples = Array.from(
      { length: ProgrammingPlanSampleMaxCount },
      () => defaultProgrammingPlanSample
    );

    expect(addProgrammingPlanSample(samples)).toBe(samples);
  });
});

describe('unassignedSubstanceKinds', () => {
  const sample = (
    substanceKinds: ProgrammingPlanSampleSetting['substanceKinds']
  ): ProgrammingPlanSampleSetting => ({
    ...defaultProgrammingPlanSample,
    substanceKinds
  });

  test('should return every analyte when there is no sample', () => {
    expect(unassignedSubstanceKinds([], ['Mono', 'Multi'])).toStrictEqual([
      'Mono',
      'Multi'
    ]);
  });

  test('should return the analytes assigned to no sample, in the level order', () => {
    expect(
      unassignedSubstanceKinds(
        [sample(['Multi']), sample([]), sample(['Copper'])],
        ['Mono', 'Multi', 'Copper', 'Any']
      )
    ).toStrictEqual(['Mono', 'Any']);
  });

  test('should return nothing when every analyte is assigned', () => {
    expect(
      unassignedSubstanceKinds(
        [sample(['Multi', 'Mono']), sample(['Copper'])],
        ['Mono', 'Multi', 'Copper']
      )
    ).toStrictEqual([]);
  });
});

describe('toggleSampleSubstanceKind', () => {
  const sample = (
    ...substanceKinds: ProgrammingPlanSampleSetting['substanceKinds']
  ): ProgrammingPlanSampleSetting => ({
    ...defaultProgrammingPlanSample,
    substanceKinds
  });

  test('should add the analyte to the sample', () => {
    expect(
      toggleSampleSubstanceKind([sample('Mono'), sample()], 0, 'Multi')
    ).toStrictEqual([sample('Mono', 'Multi'), sample()]);
  });

  test('should remove the analyte from the sample', () => {
    expect(
      toggleSampleSubstanceKind([sample('Mono', 'Multi')], 0, 'Mono')
    ).toStrictEqual([sample('Multi')]);
  });

  test('should move the analyte out of the other samples', () => {
    expect(
      toggleSampleSubstanceKind(
        [sample('Mono', 'Copper'), sample('Multi'), sample('Mono')],
        1,
        'Mono'
      )
    ).toStrictEqual([sample('Copper'), sample('Multi', 'Mono'), sample()]);
  });
});
