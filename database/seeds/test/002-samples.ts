import sampleRepository from '../../../server/repositories/sampleRepository';
import { genSample } from '../../../server/test/testFixtures';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { User1, User2 } from './001-users';

export const Sample1: Sample = genSample(User1.id);
export const Sample2: Sample = genSample(User2.id);

exports.seed = async function () {
  await sampleRepository.insert(Sample1);
  await sampleRepository.insert(Sample2);
};
