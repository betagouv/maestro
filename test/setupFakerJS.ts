import { fakerFR } from '@faker-js/faker';
import { beforeAll } from 'vitest';

beforeAll(() => {
  fakerFR.seed(Number.parseInt(__SEED__, 10));
});
