import { beforeAll } from 'vitest';
import { fakerFR } from '@faker-js/faker';

beforeAll(() => {
  fakerFR.seed(Number.parseInt(__SEED__));
});