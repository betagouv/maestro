import {
  genSampleItem,
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
  const samples = [
    Sample11Fixture,
    Sample12Fixture,
    Sample13Fixture,
    Sample2Fixture,
    SampleDAOA1Fixture,
    SampleDAOA2Fixture
  ];

  await Samples().insert(samples.map(formatPartialSample));
  await SampleItems().insert([
    Sample1Item1Fixture,
    ...samples
      .filter((sample) => sample.id !== Sample11Fixture.id)
      .map((sample) =>
        genSampleItem({
          sampleId: sample.id,
          itemNumber: 1,
          copyNumber: 1
        })
      )
  ]);
};
