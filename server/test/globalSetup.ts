import knex from 'knex';
import knexConfig from '../knex';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const knexStringcase = require('knex-stringcase');

export default async function setup() {
  const db = knex(knexStringcase(knexConfig));
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
