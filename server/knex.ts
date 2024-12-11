import config from './utils/config';

const defaultConfig = {
  client: 'pg',
  connection: config.databaseUrl,
  acquireConnectionTimeout: 10000,
  migrations: {
    tableName: 'knex_migrations',
    directory: '../database/migrations',
  },
};

const dummyConfig = {
  ...defaultConfig,
  seeds: {
    directory: '../database/seeds/dummy',
    extension: 'ts',
  },
};

const productionConfig = {
  ...defaultConfig,
  seeds: {
    directory: '../database/seeds/production',
    extension: 'ts',
  },
};

export default config.databaseEnvironment === 'production'
  ? productionConfig
  :  dummyConfig;
