import db from '../repositories/db';

export default async function teardown() {
  try {
    await db.destroy();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing the database connection:', error);
  }
}
