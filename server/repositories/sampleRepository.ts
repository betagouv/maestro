import { logger } from 'bs-logger';
import { z } from 'zod';
import { Sample, SampleToCreate } from '../../shared/schema/Sample';
import db from './db';

export const samplesTable = 'samples';

const Samples = () => db<Sample>(samplesTable);

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
  logger.info('Insert sample', sampleToInsert);
  await Samples().insert({
    ...sampleToInsert,
    userLocation: db.raw('Point(?, ?)', [
      sampleToInsert.userLocation.latitude,
      sampleToInsert.userLocation.longitude,
    ]),
  });
};

export default {
  insert,
};
