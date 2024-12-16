import { dbManager } from './db-manager';
import { afterAll, beforeAll } from 'vitest';
import { dbSeed } from './seed';

beforeAll(async () => {
  await dbManager.populateDb()
  await dbSeed()
})


afterAll(async () => {
  await dbManager.closeDb()
})
