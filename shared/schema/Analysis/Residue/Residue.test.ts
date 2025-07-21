import { expect, test } from 'vitest';
import { LmrCheck } from './Residue';

test('sampleResidueLmrCheck', () => {
  expect(
    LmrCheck.safeParse({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'NQ',
      lmr: null
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: null
    }).success
  ).toEqual(false);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: 0
    }).success
  ).toEqual(false);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: 0.5
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: null
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: 0
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: 0.5
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: null
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0.5
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: null
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0
    }).success
  ).toEqual(true);
  expect(
    LmrCheck.safeParse({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0.5
    }).success
  ).toEqual(true);
});
