import config from './utils/config';
import { Knex } from 'knex';
import defaultConfig from '../knexfile'

const productionConfig: Knex.Config = {
  ...defaultConfig,
  connection: config.databaseUrl,
  migrations: {
    tableName: 'knex_migrations',
    directory: '../database/migrations',
  },
};

const dummyConfig: Knex.Config = {
  ...productionConfig,
  seeds: {
    directory: '../database/seeds/dummy',
    extension: 'ts',
  },
};



export default config.databaseEnvironment === 'production'
  ? productionConfig
  :  dummyConfig;
