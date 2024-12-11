import config from '../config';
import { describe, test, expect } from 'vitest';

describe('Config', () => {
  test('should validate the configuration', () => {
    expect(config).toBeDefined();
  });
});
