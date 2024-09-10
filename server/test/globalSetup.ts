import db from '../repositories/db';

export default async function setup() {
  try {
    // Roll back if needed
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
    console.log('Migrated.');
    await db.seed.run();
    console.log('Seeded.');
  } finally {
    await db.destroy();
  }
}
