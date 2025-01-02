import { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';

const config: Knex.Config = {
  client: 'pg',
  acquireConnectionTimeout: 10000,
  ...knexStringcase()
};

export default config;
