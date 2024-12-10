import knex, { Knex } from 'knex';
import knexConfig from '../knex';
import { cloneDeep } from 'lodash';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const knexStringcase = require('knex-stringcase');

const options = knexStringcase(knexConfig);


let knexInstance  = knex(cloneDeep(options));
export const setKnexInstance = (newKnex: Knex) => (knexInstance = newKnex)

export default knexInstance
