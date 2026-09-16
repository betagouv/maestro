import { describe, expect, test } from 'vitest';
import {
  addProgrammingPlanSample,
  defaultProgrammingPlanSample,
  ProgrammingPlanSampleMaxCount,
  ProgrammingPlanSampleSetting
} from './ProgrammingPlanSampleSetting';

describe('ProgrammingPlanSampleSetting', () => {
  test('should accept the default sample', () => {
    expect(
      ProgrammingPlanSampleSetting.safeParse(defaultProgrammingPlanSample)
        .success
    ).toBe(true);
  });

  test.each([
    { required: false, recipientKinds: ['Laboratory'] },
    { required: true, recipientKinds: ['Sampler'] },
    { required: true, recipientKinds: ['Laboratory', 'Sampler'] }
  ])(
    'should refuse a first copy other than a required laboratory copy: %j',
    (firstCopy) => {
      expect(
        ProgrammingPlanSampleSetting.safeParse({
          ...defaultProgrammingPlanSample,
          copies: [firstCopy, ...defaultProgrammingPlanSample.copies.slice(1)]
        }).success
      ).toBe(false);
    }
  );

  test('should refuse a copy without recipient', () => {
    const [laboratoryCopy, secondCopy] = defaultProgrammingPlanSample.copies;

    expect(
      ProgrammingPlanSampleSetting.safeParse({
        ...defaultProgrammingPlanSample,
        copies: [
          laboratoryCopy,
          secondCopy,
          { required: true, recipientKinds: [] }
        ]
      }).success
    ).toBe(false);
  });

  test.each([2, 4])('should refuse %i copies', (copyCount) => {
    expect(
      ProgrammingPlanSampleSetting.safeParse({
        ...defaultProgrammingPlanSample,
        copies: Array.from(
          { length: copyCount },
          (_, index) => defaultProgrammingPlanSample.copies[Math.min(index, 2)]
        )
      }).success
    ).toBe(false);
  });

  describe('addProgrammingPlanSample', () => {
    test('should add a default sample to an empty configuration', () => {
      expect(addProgrammingPlanSample([])).toStrictEqual([
        defaultProgrammingPlanSample
      ]);
    });

    test('should add a sample without analyte, with the copies of the last sample', () => {
      const [laboratoryCopy] = defaultProgrammingPlanSample.copies;
      const lastSample: ProgrammingPlanSampleSetting = {
        substanceKind: 'Multi',
        copies: [
          laboratoryCopy,
          { required: true, recipientKinds: ['Laboratory'] },
          { required: false, recipientKinds: ['Operator'] }
        ]
      };

      expect(
        addProgrammingPlanSample([
          { ...defaultProgrammingPlanSample, substanceKind: 'Mono' },
          lastSample
        ])
      ).toStrictEqual([
        { ...defaultProgrammingPlanSample, substanceKind: 'Mono' },
        lastSample,
        { substanceKind: null, copies: lastSample.copies }
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
});
