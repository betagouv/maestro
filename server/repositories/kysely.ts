import {
  CamelCasePlugin,
  Kysely,
  PostgresDialect,
  type Transaction
} from 'kysely';
import pg from 'pg';
import config from '../utils/config';
import type { DB, KyselyMaestro } from './kysely.type';
import type { DB as NewDB, NewKyselyMaestro } from './kysely.types2';
/**
 * @deprecated use newKysely2
 */
export let kysely: KyselyMaestro;
export let newKysely2: NewKyselyMaestro;
export const initKysely = (connectionString: string) => {
  const pool = new pg.Pool({
    connectionString,
    max: config.databasePool.kyselyMax,
    connectionTimeoutMillis: 10000
  });
  kysely = new Kysely<DB>({
    // log(event) {
    //   if (event.level === "error") {
    //     console.error("Query failed : ", {
    //       durationMs: event.queryDurationMillis,
    //       error: event.error,
    //       sql: event.query.sql,
    //       params: event.query.parameters,
    //     });
    //   } else { // `'query'`
    //     console.log("Query executed : ", {
    //       durationMs: event.queryDurationMillis,
    //       sql: event.query.sql,
    //       params: event.query.parameters,
    //     });
    //   }
    // },
    dialect: new PostgresDialect({
      pool: pool
    }),
    plugins: [new CamelCasePlugin()]
  });
  newKysely2 = new Kysely<NewDB>({
    dialect: new PostgresDialect({
      pool: pool
    })
  });
};

/**
 * @deprecated use types2.ts
 */
export const executeTransaction = <T>(
  callback: (trx: Transaction<DB>) => Promise<T>
): Promise<T> => {
  return kysely.transaction().execute((trx) => callback(trx));
};
export const executeNewTransaction = <T>(
  callback: (trx: Transaction<NewDB>) => Promise<T>
): Promise<T> => {
  return newKysely2.transaction().execute((trx) => callback(trx));
};
