import { isNil, omit, omitBy } from 'lodash-es';
import { FindSubstanceOptions } from 'maestro-shared/schema/Substance/FindSubstanceOptions';
import { Substance } from 'maestro-shared/schema/Substance/Substance';
import {knexInstance as db} from './db';

export const substancesTable = 'substances';
export const Substances = () => db(substancesTable);

const findMany = async (findOptions: FindSubstanceOptions) => {
  console.info('Find substances', findOptions);
  return Substances()
    .where(omitBy(omit(findOptions, 'q'), isNil))
    .modify((builder) => {
      if (findOptions.q) {
        builder.where('label', 'like', `%${findOptions.q}%`);
      }
    })
    .then((substances) =>
      substances.map((_: any) => Substance.parse(omitBy(_, isNil)))
    );
};

export default {
  findMany,
};
