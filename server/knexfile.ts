import type { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';
import config from './utils/config';

const knexConfig: Knex.Config = {
  client: 'pg',
  acquireConnectionTimeout: 10000,
  ...knexStringcase(),
  connection: config.databaseUrl,
  migrations: {
    tableName: 'knex_migrations',
    directory: 'database/migrations'
  }
};

export default knexConfig;
