import { describe, expect, test } from 'vitest';
import { CultureKind } from '../../referential/CultureKind';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { getSampleMatrixSpecificDataAttributeValues } from './SampleMatrixSpecificData';

describe('getSampleMatrixSpecificDataAttributeValues', () => {
  test('returns cultureKind options for PPV', () => {
    const result = getSampleMatrixSpecificDataAttributeValues(
      ProgrammingPlanKind.enum.PPV,
      'cultureKind'
    );
    expect(result).toBe(CultureKind.options);
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
});
