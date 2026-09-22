import { describe, expect, test } from 'vitest';
import {
  assignSampleLaboratory,
  groupSubstanceKindsLaboratoriesBySample
} from './sampleLaboratories';

const laboratoryId = '11111111-1111-4111-8111-111111111111';
const otherLaboratoryId = '22222222-2222-4222-8222-222222222222';

describe('groupSubstanceKindsLaboratoriesBySample', () => {
  test('should group the analytes by sample, with their common laboratory', () => {
    expect(
      groupSubstanceKindsLaboratoriesBySample(
        [{ substanceKinds: ['Multi', 'Copper'] }, { substanceKinds: ['Mono'] }],
        [
          { substanceKind: 'Mono', laboratoryId: otherLaboratoryId },
          { substanceKind: 'Multi', laboratoryId },
          { substanceKind: 'Copper', laboratoryId }
        ]
      )
    ).toStrictEqual([
      { substanceKinds: ['Multi', 'Copper'], laboratoryId },
      { substanceKinds: ['Mono'], laboratoryId: otherLaboratoryId }
    ]);
  });

  test('should leave no laboratory to a sample whose analytes have different laboratories', () => {
    expect(
      groupSubstanceKindsLaboratoriesBySample(
        [{ substanceKinds: ['Mono', 'Multi'] }],
        [
          { substanceKind: 'Mono', laboratoryId },
          { substanceKind: 'Multi', laboratoryId: otherLaboratoryId }
        ]
      )
    ).toStrictEqual([
      { substanceKinds: ['Mono', 'Multi'], laboratoryId: null }
    ]);
  });

  test('should put each analyte in its own sample without samples configuration', () => {
    expect(
      groupSubstanceKindsLaboratoriesBySample(null, [
        { substanceKind: 'Mono', laboratoryId },
        { substanceKind: 'Multi' }
      ])
    ).toStrictEqual([
      { substanceKinds: ['Mono'], laboratoryId },
      { substanceKinds: ['Multi'], laboratoryId: null }
    ]);
  });

  test('should put an analyte outside of every sample in its own sample', () => {
    expect(
      groupSubstanceKindsLaboratoriesBySample(
        [{ substanceKinds: ['Mono'] }],
        [
          { substanceKind: 'Mono', laboratoryId },
          { substanceKind: 'Copper', laboratoryId: otherLaboratoryId }
        ]
      )
    ).toStrictEqual([
      { substanceKinds: ['Mono'], laboratoryId },
      { substanceKinds: ['Copper'], laboratoryId: otherLaboratoryId }
    ]);
  });

  test('should ignore the analytes of a sample that are not to be assigned', () => {
    expect(
      groupSubstanceKindsLaboratoriesBySample(
        [{ substanceKinds: ['Mono', 'Any'] }, { substanceKinds: ['Copper'] }],
        [{ substanceKind: 'Mono', laboratoryId }]
      )
    ).toStrictEqual([{ substanceKinds: ['Mono'], laboratoryId }]);
  });
});

describe('assignSampleLaboratory', () => {
  test('should give the laboratory to every analyte of the sample only', () => {
    expect(
      assignSampleLaboratory(
        [
          { substanceKind: 'Mono', laboratoryId: otherLaboratoryId },
          { substanceKind: 'Multi' },
          { substanceKind: 'Copper', laboratoryId: otherLaboratoryId }
        ],
        ['Mono', 'Multi'],
        laboratoryId
      )
    ).toStrictEqual([
      { substanceKind: 'Mono', laboratoryId },
      { substanceKind: 'Multi', laboratoryId },
      { substanceKind: 'Copper', laboratoryId: otherLaboratoryId }
    ]);
  });
});
