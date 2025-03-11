import { describe, expect, test } from 'vitest';
import workbookUtils from '../workbookUtils';

describe('WorkbookUtils', () => {
  describe('sanitizeExcelData', () => {
    test('should return the same number if the input is a number', () => {
      expect(workbookUtils.sanitizeExcelData(123)).toBe(123);
    });

    test('should return the same string if it does not start with =, +, -, or @', () => {
      expect(workbookUtils.sanitizeExcelData('test')).toBe('test');
    });

    test('should prefix the string with a single quote if it starts with =', () => {
      expect(workbookUtils.sanitizeExcelData('=SUM(A1:A2)')).toBe(
        "'=SUM(A1:A2)"
      );
    });

    test('should prefix the string with a single quote if it starts with +', () => {
      expect(workbookUtils.sanitizeExcelData('+123')).toBe("'+123");
    });

    test('should prefix the string with a single quote if it starts with -', () => {
      expect(workbookUtils.sanitizeExcelData('-123')).toBe("'-123");
    });

    test('should prefix the string with a single quote if it starts with @', () => {
      expect(workbookUtils.sanitizeExcelData('@username')).toBe("'@username");
    });

    test('should return null if the input is null', () => {
      expect(workbookUtils.sanitizeExcelData(null)).toBeNull();
    });
  });
});
