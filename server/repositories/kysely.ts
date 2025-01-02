import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './kysely.type';

export let kysely: Kysely<DB>;

export const initKysely = (connectionString: string) =>
  (kysely = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString,
        max: 10
      })
    }),
    plugins: [new CamelCasePlugin()]
  }));
