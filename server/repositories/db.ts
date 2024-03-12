import knex from 'knex';
import knexConfig from '../knex';
const knexStringcase = require('knex-stringcase');

const options = knexStringcase(knexConfig);
export default knex(options);
