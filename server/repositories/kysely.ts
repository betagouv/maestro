import { CamelCasePlugin, Kysely, PostgresDialect, Transaction } from 'kysely';
import pg from 'pg';
import { DB, KyselyMaestro } from './kysely.type';

export let kysely: KyselyMaestro;

export const initKysely = (connectionString: string) =>
  (kysely = new Kysely<DB>({
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
      pool: new pg.Pool({
        connectionString,
        max: 10
      })
    }),
    plugins: [new CamelCasePlugin()]
  }));

export const executeTransaction = <T>(
  callback: (trx: Transaction<DB>) => Promise<T>
): Promise<T> => {
  return kysely.transaction().execute((trx) => callback(trx));
};
