import { CamelCasePlugin, Kysely, PostgresDialect, Transaction } from 'kysely';
import { DB, KyselyMaestro } from './kysely.type';
import pg from 'pg'

export let kysely: KyselyMaestro

export const initKysely = (connectionString: string) => ( kysely = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
      max: 10,
    })
  }),
  plugins: [new CamelCasePlugin()]
}))


export const executeTransaction = <T>(callback: (trx: Transaction<DB>) => Promise<T>): Promise<T> => {
  return kysely.transaction().execute(trx => callback(trx))
}
