import { describe, expect, test } from 'vitest';
import { sampleLegalContext } from './sampleLegalContext';

describe('sampleLegalContext', () => {
  test('should keep the chosen legal context for a PPV sample, programmed or not', () => {
    expect(
      sampleLegalContext({ isPPV: true, context: 'Control', legalContext: 'B' })
    ).toBe('B');
    expect(
      sampleLegalContext({
        isPPV: true,
        context: 'OutsideProgrammingPlan',
        legalContext: 'B'
      })
    ).toBe('B');
  });

  test('should be administrative police for a programmed sample outside PPV', () => {
    expect(sampleLegalContext({ isPPV: false, context: 'Surveillance' })).toBe(
      'A'
    );
  });

  test('should be empty for a sample outside the programming plan and outside PPV', () => {
    expect(
      sampleLegalContext({
        isPPV: false,
        context: 'OutsideProgrammingPlan',
        legalContext: 'A'
      })
    ).toBeNull();
  });
});
