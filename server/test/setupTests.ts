import { enableFetchMocks } from 'jest-fetch-mock';
import knex from 'knex';
import knexConfig from '../knex';
import db from '../repositories/db';

enableFetchMocks();

jest.useFakeTimers({
  legacyFakeTimers: true,
});

global.beforeEach(async () => {
  const db = knex(knexConfig);
  try {
    await db.migrate.latest();
    await db.seed.run();
  } finally {
    await db.destroy();
  }
});

global.afterEach(async () => {
  const db = knex(knexConfig);
  try {
    await db.migrate.rollback();
  } finally {
    await db.destroy();
  }
});

global.afterAll(async () => {
  await db.destroy();
});
