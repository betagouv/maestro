import { dbManager } from './db-manager';
import { afterAll, beforeAll } from 'vitest';

beforeAll(async () => {
  await dbManager.populateDb()
})


afterAll(async () => {
  await dbManager.closeDb()
})
