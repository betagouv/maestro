import {
  Sample11Fixture,
  Sample12Fixture,
  Sample13Fixture,
  Sample1Item1Fixture,
  Sample2Fixture,
  SampleDAOA1Fixture,
  SampleDAOA2Fixture
} from 'maestro-shared/test/sampleFixtures';
import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples
} from '../../repositories/sampleRepository';

export const seed = async (): Promise<void> => {
  await Samples().insert(
    [
      Sample11Fixture,
      Sample12Fixture,
      Sample13Fixture,
      Sample2Fixture,
      SampleDAOA1Fixture,
      SampleDAOA2Fixture
    ].map(formatPartialSample)
  );
  await SampleItems().insert(Sample1Item1Fixture);
};
