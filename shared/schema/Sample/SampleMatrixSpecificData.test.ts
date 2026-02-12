import { describe, expect, test } from 'vitest';
import { CultureKindList } from '../../referential/CultureKind';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { getSampleMatrixSpecificDataAttributeValues } from './SampleMatrixSpecificData';

describe('getSampleMatrixSpecificDataAttributeValues', () => {
  test('returns cultureKind options for PPV', () => {
    const result = getSampleMatrixSpecificDataAttributeValues(
      ProgrammingPlanKind.enum.PPV,
      'cultureKind'
    );
    expect(result).toBe(CultureKindList);
  });

  test('returns null for matrixDetails (string field without options)', () => {
    const result = getSampleMatrixSpecificDataAttributeValues(
      ProgrammingPlanKind.enum.PPV,
      'matrixDetails'
    );
    expect(result).toHaveLength(0);
  });

  test('returns only the filtered species options for DAOA_BREEDING', () => {
    const result = getSampleMatrixSpecificDataAttributeValues(
      ProgrammingPlanKind.enum.DAOA_BREEDING,
      'species'
    );
    expect(result).toEqual(['ESP7', 'ESP8', 'ESP10', 'ESP20']);
  });
  test('returns correctly value from literal', () => {
    const result = getSampleMatrixSpecificDataAttributeValues(
      ProgrammingPlanKind.enum.DAOA_SLAUGHTER,
      'sampling'
    );
    expect(result).toEqual(['Aléatoire']);
  });
  test('returns correctly value from nullish', () => {
    const result = getSampleMatrixSpecificDataAttributeValues(
      ProgrammingPlanKind.enum.DAOA_SLAUGHTER,
      'seizure'
    );
    expect(result).toEqual(['EMPTY', 'PARTIAL', 'TOTAL']);
  });
});
