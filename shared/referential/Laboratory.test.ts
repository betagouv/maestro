import { describe, expect, test } from 'vitest';
import { isAnalysisCorrectionReportable } from './Laboratory';

describe('isAnalysisCorrectionReportable', () => {
  test('is reportable for a PPV analysis from an automated laboratory', () => {
    expect(isAnalysisCorrectionReportable('PPV', 'GIR 49')).toBe(true);
  });

  test('is not reportable for a PPV analysis from a non automated laboratory', () => {
    expect(isAnalysisCorrectionReportable('PPV', 'SCL 13')).toBe(false);
  });

  test('is not reportable for a PPV analysis without laboratory', () => {
    expect(isAnalysisCorrectionReportable('PPV', undefined)).toBe(false);
  });

  test('is reportable outside PPV whatever the laboratory', () => {
    expect(isAnalysisCorrectionReportable('DAOA_BOVIN', 'SCL 13')).toBe(true);
    expect(isAnalysisCorrectionReportable(undefined, undefined)).toBe(true);
  });
});
