import knex, { Knex } from 'knex';
import knexConfig from '../knex';
import { cloneDeep } from 'lodash';
import knexStringcase from 'knex-stringcase';



// @ts-ignore
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
