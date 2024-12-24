import knex, { Knex } from 'knex';
import knexConfig from '../knex';
import { cloneDeep } from 'lodash-es';


//@ts-expect-error TS2322
let knexInstance: Knex  = null;
export const setKnexInstance = (newKnex: Knex) => (knexInstance = newKnex)



export const initKnex = () => {
  setKnexInstance(knex(cloneDeep(knexConfig)))
}
export {knexInstance}

export default knexInstance
