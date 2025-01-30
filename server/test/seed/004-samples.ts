import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples
} from '../../repositories/sampleRepository';
import {
  Sample11Fixture,
  Sample12Fixture,
  Sample13Fixture,
  Sample1Item1Fixture,
  Sample2Fixture
} from 'maestro-shared/test/sampleFixtures';

export const seed = async (): Promise<void> => {
  await Samples().insert([
    formatPartialSample(Sample11Fixture),
    formatPartialSample(Sample12Fixture),
    formatPartialSample(Sample13Fixture),
    formatPartialSample(Sample2Fixture)
  ]);
  await SampleItems().insert(Sample1Item1Fixture);
};
