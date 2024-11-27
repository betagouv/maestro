import { CamelCasePlugin,  Kysely, PostgresDialect } from 'kysely';
import { DB } from './kysely.type';
import { Pool } from 'pg';
import knex from '../knex';

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: knex.connection,
    max: 10,
  })
})


export const kysely = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()]
})


