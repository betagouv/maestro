import db from '../repositories/db';
import { dbManager } from './db-manager';

export const setup = async () => {
  try {
    // Roll back if needed
  await    dbManager.populateDb()
    console.log('Migrated.');
    console.log('Seeded.');
  } finally {
    await db.destroy();
  }
}
export async function teardown() {
 try {
    await db.destroy();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing the database connection:', error);
  }
}
