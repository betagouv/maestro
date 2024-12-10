import config from '../config';
import { describe, test, expect } from 'vitest';

//FIXME unit
describe('Config', () => {
  test('should validate the configuration', () => {
    expect(config).toBeDefined();
  });
});
