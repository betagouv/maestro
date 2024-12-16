import knexStringcase from 'knex-stringcase';
import { Knex } from 'knex';

const config: Knex.Config = {
  client: 'pg',
  acquireConnectionTimeout: 10000,
  ...knexStringcase()
};

export default config