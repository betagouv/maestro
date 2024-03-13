import {
  CreatedSample,
  PartialSample,
  Sample,
} from '../../shared/schema/Sample';
import db from './db';

export const samplesTable = 'samples';
const samplesSerial = 'samples_serial';

export const Samples = () => db<Sample>(samplesTable);

const findUnique = async (id: string): Promise<Sample | undefined> => {
  console.info('Find sample', id);
  return Samples().where({ id }).first();
};

const findMany = async (userId: string): Promise<Sample[]> => {
  console.info('Find samples for user', userId);
  return Samples().where({ createdBy: userId });
};

const getSerial = async (): Promise<number> => {
  const result = await db.select(db.raw(`nextval('${samplesSerial}')`)).first();
  return result.nextval;
};

const insert = async (createdSample: CreatedSample): Promise<void> => {
  console.info('Insert sample', createdSample);
  await Samples().insert({
    ...createdSample,
    userLocation: db.raw('Point(?, ?)', [
      createdSample.userLocation.x,
      createdSample.userLocation.y,
    ]),
  });
};

const update = async (partialSample: PartialSample): Promise<void> => {
  console.info('Update sample', partialSample.id);
  if (Object.keys(partialSample).length > 0) {
    await Samples()
      .where({ id: partialSample.id })
      .update({
        ...partialSample,
        userLocation: db.raw('Point(?, ?)', [
          partialSample.userLocation.x,
          partialSample.userLocation.y,
        ]),
      });
  }
};

export default {
  insert,
  update,
  findUnique,
  findMany,
  getSerial,
};
