import fp from 'lodash';
import { Laboratory } from '../../shared/schema/Laboratory/Laboratory';
import db from './db';

const laboratoryTable = 'laboratories';

export const Laboratories = () => db<Laboratory>(laboratoryTable);

const findMany = async (): Promise<Laboratory[]> => {
  console.info('Find laboratories');
  return Laboratories().then((laboratories) =>
    laboratories.map((_) => Laboratory.parse(fp.omitBy(_, fp.isNil)))
  );
};

export default {
  findMany,
};
