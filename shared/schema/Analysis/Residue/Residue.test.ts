import { expect, test } from 'vitest';
import { genPartialResidue } from '../../../test/analysisFixtures';
import { Sample11Fixture } from '../../../test/sampleFixtures';
import { PartialResidueLmrCheck } from './Residue';

test('sampleResidueLmrCheck', () => {
  expect(
    PartialResidueLmrCheck.safeParse({
      stage: 'STADE1',
      specificData: {
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      resultKind: 'NQ',
      lmr: null
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE1',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: null
      })
    }).success
  ).toEqual(false);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE1',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: 0
      })
    }).success
  ).toEqual(false);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE1',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: 0.5
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE2',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: null
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE2',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: 0
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE2',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART1'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: 0.5
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE1',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: null
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE1',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: 0
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE1',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: 0.5
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE2',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: null
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE2',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: 0
      })
    }).success
  ).toEqual(true);
  expect(
    PartialResidueLmrCheck.safeParse({
      ...Sample11Fixture,
      stage: 'STADE2',
      specificData: {
        ...Sample11Fixture.specificData,
        programmingPlanKind: 'PPV',
        matrixPart: 'PART2'
      },
      ...genPartialResidue({
        resultKind: 'Q',
        lmr: 0.5
      })
    }).success
  ).toEqual(true);
});
