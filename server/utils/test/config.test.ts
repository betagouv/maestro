import { describe, expect, test } from 'vitest';
import config from '../config';

describe('Config', () => {
  test('should validate the configuration', () => {
    expect(config).toBeDefined();
  });
});
