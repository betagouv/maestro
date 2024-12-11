import fp from 'lodash';
import { FindSubstanceOptions } from '../../shared/schema/Substance/FindSubstanceOptions';
import { Substance } from '../../shared/schema/Substance/Substance';
import {knexInstance as db} from './db';

export const substancesTable = 'substances';
export const Substances = () => db(substancesTable);

const findMany = async (findOptions: FindSubstanceOptions) => {
  console.info('Find substances', findOptions);
  return Substances()
    .where(fp.omitBy(fp.omit(findOptions, 'q'), fp.isNil))
    .modify((builder) => {
      if (findOptions.q) {
        builder.where('label', 'like', `%${findOptions.q}%`);
      }
    })
    .then((substances) =>
      substances.map((_: any) => Substance.parse(fp.omitBy(_, fp.isNil)))
    );
};

export default {
  findMany,
};
