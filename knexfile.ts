import knexStringcase from 'knex-stringcase';
import { Knex } from 'knex';

//@ts-expect-error TS2239 https://github.com/Kequc/knex-stringcase/issues/28#issuecomment-2475324275
const knexString = typeof knexStringcase === 'function' ? knexStringcase() : knexStringcase.default()
const config: Knex.Config = {
  client: 'pg',
  acquireConnectionTimeout: 10000,
  ...knexString
};

export default config