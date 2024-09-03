import knex from 'knex';
import knexConfig from '../knex';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const knexStringcase = require('knex-stringcase');

const options = knexStringcase(knexConfig);
export default knex(options);
