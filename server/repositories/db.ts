import knex, { Knex } from 'knex';
import knexConfig from '../knex';
import { cloneDeep } from 'lodash';
import knexStringcase from 'knex-stringcase';


//@ts-expect-error TS2322
let knexInstance: Knex  = null;
export const setKnexInstance = (newKnex: Knex) => (knexInstance = newKnex)



export const initKnex = () => {
  setKnexInstance(knex(cloneDeep({
    ...knexConfig,
    ...knexStringcase()
  })))
}
export {knexInstance}

export default knexInstance
