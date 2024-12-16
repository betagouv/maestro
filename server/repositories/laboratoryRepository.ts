import fp from 'lodash';
import { Laboratory } from '../../shared/schema/Laboratory/Laboratory';
import {knexInstance as db} from './db';

const laboratoryTable = 'laboratories';

export const Laboratories = () => db<Laboratory>(laboratoryTable);

const findUnique = async (id: string): Promise<Laboratory | undefined> => {
  console.info('Find laboratory by id', id);
  return Laboratories()
    .where({ id })
    .first()
    .then((_) => _ && Laboratory.parse(fp.omitBy(_, fp.isNil)));
};

const findMany = async (): Promise<Laboratory[]> => {
  console.info('Find laboratories');
  return Laboratories().then((laboratories) =>
    laboratories.map((_) => Laboratory.parse(fp.omitBy(_, fp.isNil)))
  );
};

export default {
  findUnique,
  findMany,
};
