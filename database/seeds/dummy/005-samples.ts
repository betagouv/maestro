import { faker } from '@faker-js/faker';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { SampleItems } from '../../../server/repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples,
} from '../../../server/repositories/sampleRepository';
import { Users } from '../../../server/repositories/userRepository';
import { Regions } from '../../../shared/referential/Region';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { genSample, oneOf } from '../../../shared/test/testFixtures';

exports.seed = async function () {
  const validatedControlProgrammingPlan = await ProgrammingPlans()
    .where({ status: 'Validated', kind: 'Control' })
    .first();

  const sampler = await Users()
    .where({ roles: ['Sampler'] })
    .first();

  if (!validatedControlProgrammingPlan || !sampler) {
    return;
  }

  const samples = [
    faker.helpers.multiple<Sample>(
      () => ({
        ...genSample(sampler.id, validatedControlProgrammingPlan.id),
        matrix: 'A0DVX',
        stage: 'STADE1',
        status: 'Sent',
        department: oneOf(Regions[sampler.region!].departments),
      }),
      { count: 2 }
    ),
    faker.helpers.multiple<Sample>(
      () => ({
        ...genSample(sampler.id, validatedControlProgrammingPlan.id),
        matrix: 'A000F',
        stage: 'STADE1',
        status: 'Sent',
        department: oneOf(Regions[sampler.region!].departments),
      }),
      { count: 8 }
    ),
    faker.helpers.multiple<Sample>(
      () => ({
        ...genSample(sampler.id, validatedControlProgrammingPlan.id),
        matrix: 'A00QH',
        stage: 'STADE1',
        status: 'Sent',
        department: oneOf(Regions[sampler.region!].departments),
      }),
      { count: 3 }
    ),
    faker.helpers.multiple<Sample>(
      () => ({
        ...genSample(sampler.id, validatedControlProgrammingPlan.id),
        matrix: 'A01GG',
        stage: 'STADE1',
        status: 'Sent',
        department: oneOf(Regions[sampler.region!].departments),
      }),
      { count: 4 }
    ),
    faker.helpers.multiple<Sample>(
      () => ({
        ...genSample(sampler.id, validatedControlProgrammingPlan.id),
        matrix: 'A00HC',
        stage: 'STADE1',
        status: 'Sent',
        department: oneOf(Regions[sampler.region!].departments),
      }),
      { count: 7 }
    ),
    faker.helpers.multiple<Sample>(
      () => ({
        ...genSample(sampler.id, validatedControlProgrammingPlan.id),
        matrix: 'A0DFB',
        stage: 'STADE1',
        status: 'Sent',
        department: oneOf(Regions[sampler.region!].departments),
      }),
      { count: 6 }
    ),
    faker.helpers.multiple<Sample>(
      () => ({
        ...genSample(sampler.id, validatedControlProgrammingPlan.id),
        matrix: 'A0DFR',
        stage: 'STADE1',
        status: 'Sent',
        department: oneOf(Regions[sampler.region!].departments),
      }),
      { count: 6 }
    ),
  ];

  const sampleItems = samples
    .flat()
    .map((sample: Sample) => sample.items)
    .flat();

  await Samples().insert(
    samples.flat().map((_: any) => formatPartialSample(_))
  );

  await SampleItems().insert(sampleItems);
};
