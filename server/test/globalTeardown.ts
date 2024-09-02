import knex from 'knex';
import knexConfig from '../knex';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const knexStringcase = require('knex-stringcase');

export default async function teardown() {
  const db = knex(knexStringcase(knexConfig));
  await db.destroy();
}
