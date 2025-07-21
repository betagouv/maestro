import { expect, test } from 'vitest';
import { LmrIsValid } from './Residue';

test('sampleResidueLmrIsValid', () => {
  expect(
    LmrIsValid({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'NQ',
      lmr: null
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: null
    })
  ).toEqual(false);
  expect(
    LmrIsValid({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: 0
    })
  ).toEqual(false);
  expect(
    LmrIsValid({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: 0.5
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: null
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: 0
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'Q',
      lmr: 0.5
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: null
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE1',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0.5
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: null
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0
    })
  ).toEqual(true);
  expect(
    LmrIsValid({
      stage: 'STADE2',
      specificData: {
        cultureKind: 'PD06A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0.5
    })
  ).toEqual(true);
});
