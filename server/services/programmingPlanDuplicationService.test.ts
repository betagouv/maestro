import { describe, expect, test } from 'vitest';
import { nextSubPlanNumber } from './programmingPlanDuplicationService';

describe('nextSubPlanNumber', () => {
  test('should take the number following the source', () => {
    expect(nextSubPlanNumber('M02', ['M01', 'M02'])).toBe('M03');
  });

  test('should skip the numbers already taken', () => {
    expect(nextSubPlanNumber('M01', ['M01', 'M02', 'M03'])).toBe('M04');
  });

  test('should keep the prefix and the width of the source', () => {
    expect(nextSubPlanNumber('PPV33', ['PPV01', 'PPV33'])).toBe('PPV34');
  });

  test('should keep a width beyond two digits', () => {
    expect(nextSubPlanNumber('PPV100', ['PPV100'])).toBe('PPV101');
  });

  test('should number a prefix-less sub-plan', () => {
    expect(nextSubPlanNumber('102', ['101', '102'])).toBe('103');
  });

  test('should number a sub-plan whose source carries no digit', () => {
    expect(nextSubPlanNumber('PPV', ['PPV'])).toBe('PPV01');
  });

  test('should leave a hole alone rather than fill it', () => {
    expect(nextSubPlanNumber('M03', ['M01', 'M03'])).toBe('M04');
  });
});
