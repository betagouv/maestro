import { describe, expect, test } from 'vitest';
import { resolveSubstanceKindsLaboratoryId } from './SampleItem';

describe('resolveSubstanceKindsLaboratoryId', () => {
  const laboratoryId = '11111111-1111-4111-8111-111111111111';
  const otherLaboratoryId = '22222222-2222-4222-8222-222222222222';

  test('should return the laboratory of a single analyte', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        ['Mono'],
        [
          { substanceKind: 'Mono', laboratoryId },
          { substanceKind: 'Multi', laboratoryId: otherLaboratoryId }
        ]
      )
    ).toBe(laboratoryId);
  });

  test('should return the laboratory shared by every analyte', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        ['Mono', 'Multi'],
        [
          { substanceKind: 'Mono', laboratoryId },
          { substanceKind: 'Multi', laboratoryId }
        ]
      )
    ).toBe(laboratoryId);
  });

  test('should return null when the analytes have different laboratories', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        ['Mono', 'Multi'],
        [
          { substanceKind: 'Mono', laboratoryId },
          { substanceKind: 'Multi', laboratoryId: otherLaboratoryId }
        ]
      )
    ).toBeNull();
  });

  test('should return null when an analyte has no laboratory', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        ['Mono', 'Multi'],
        [{ substanceKind: 'Mono', laboratoryId }]
      )
    ).toBeNull();
  });

  test('should return null without analyte', () => {
    expect(
      resolveSubstanceKindsLaboratoryId(
        [],
        [{ substanceKind: 'Mono', laboratoryId }]
      )
    ).toBeNull();
  });
});
