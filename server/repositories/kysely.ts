import { CamelCasePlugin,  Kysely, PostgresDialect } from 'kysely';
import { DB } from './kysely.type';
import { Pool } from 'pg';

export let kysely: Kysely<DB>

export const initKysely = (connectionString: string) => ( kysely = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString,
      max: 10,
    })
  }),
  plugins: [new CamelCasePlugin()]
}))


