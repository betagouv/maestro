import { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';
import config from './utils/config';

const knexString =
  typeof knexStringcase === 'function'
    ? knexStringcase()
    : //@ts-expect-error TS2239 https://github.com/Kequc/knex-stringcase/issues/28#issuecomment-2475324275
      knexStringcase.default();
const knexConfig: Knex.Config = {
  client: 'pg',
  acquireConnectionTimeout: 10000,
  ...knexString,
  connection: config.databaseUrl,
  migrations: {
    tableName: 'knex_migrations',
    directory: 'database/migrations'
  }
};

export default knexConfig;
