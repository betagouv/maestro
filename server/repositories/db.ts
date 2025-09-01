import knex, { Knex } from 'knex';
import { cloneDeep } from 'lodash-es';
import knexConfig from '../knexfile';

//@ts-expect-error TS2322
let knexInstance: Knex = null;
export const setKnexInstance = (newKnex: Knex) => (knexInstance = newKnex);

export const initKnex = () => {
  setKnexInstance(knex(cloneDeep(knexConfig)));
};
export { knexInstance };
