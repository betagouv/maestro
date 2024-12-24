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

export default productionConfig
