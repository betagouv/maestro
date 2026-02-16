import { expect, test } from 'vitest';
import { LmrIsValid } from './Residue';

test('sampleResidueLmrIsValid', () => {
  expect(
    LmrIsValid({
      stage: 'STADE1',
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
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
      reference: 'RF-0847-001-PPP',
      specificData: {
        productionKind: 'PD07A',
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      resultKind: 'Q',
      lmr: 0.5
    })
  ).toEqual(true);
});

test('lmr can be optional for some reference', () => {
  const sampleWithRequiredLmr = {
    stage: 'STADE1',
    specificData: {
      productionKind: 'PD07A',
      programmingPlanKind: 'PPV',
      matrixPart: 'PART1'
    },
    resultKind: 'Q',
    lmr: null
  } as const;

  expect(
    LmrIsValid({
      ...sampleWithRequiredLmr,
      reference: ''
    })
  ).toEqual(false);

  expect(
    LmrIsValid({
      ...sampleWithRequiredLmr,
      reference: 'RF-0847-001-PPP'
    })
  ).toEqual(false);

  expect(
    LmrIsValid({
      ...sampleWithRequiredLmr,
      reference: 'RF-0848-001-PPP'
    })
  ).toEqual(true);
});
