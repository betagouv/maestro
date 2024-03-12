import { z } from 'zod';
import { Sample, SampleToCreate } from '../../shared/schema/Sample';
import db from './db';

export const samplesTable = 'samples';

export const Samples = () => db<Sample>(samplesTable);

const SampleToInsert = SampleToCreate.merge(
  Sample.pick({
    id: true,
    reference: true,
    createdAt: true,
    createdBy: true,
  })
);

const insert = async (
  sampleToInsert: z.infer<typeof SampleToInsert>
): Promise<void> => {
  console.info('Insert sample', sampleToInsert);
  await Samples().insert({
    ...sampleToInsert,
    userLocation: db.raw('Point(?, ?)', [
      sampleToInsert.userLocation.x,
      sampleToInsert.userLocation.y,
    ]),
  });
};

export default {
  insert,
};
