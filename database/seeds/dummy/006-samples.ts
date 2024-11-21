import { faker } from '@faker-js/faker';
import { Companies } from '../../../server/repositories/companyRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { SampleItems } from '../../../server/repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples,
} from '../../../server/repositories/sampleRepository';
import { Users } from '../../../server/repositories/userRepository';
import { Regions } from '../../../shared/referential/Region';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { genCreatedSample } from '../../../shared/test/sampleFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import {
  abricotsEtSimilaires,
  avoineEtSimilaires,
  carottes,
  cerisesEtSimilaires,
  fevesDeSoja,
  lentilles,
  oignons,
} from './004-prescriptions';

exports.seed = async function () {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ status: 'Validated' })
    .first();

  const sampler = await Users()
    .where({ roles: ['Sampler'] })
    .first();

  const companies = await Companies();

  if (!validatedProgrammingPlan || !sampler) {
    return;
  }

  const samples = [
    faker.helpers.multiple<Sample>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrix: 'A0DVX',
          stage: 'STADE1',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
          company: oneOf(companies),
          prescriptionId: abricotsEtSimilaires.id,
        }),
      { count: 2 }
    ),
    faker.helpers.multiple<Sample>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrix: 'A000F',
          stage: 'STADE1',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
          company: oneOf(companies),
          prescriptionId: avoineEtSimilaires.id,
        }),
      { count: 8 }
    ),
    faker.helpers.multiple<Sample>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrix: 'A00QH',
          stage: 'STADE1',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
          company: oneOf(companies),
          prescriptionId: carottes.id,
        }),
      { count: 3 }
    ),
    faker.helpers.multiple<Sample>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrix: 'A01GG',
          stage: 'STADE1',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
          company: oneOf(companies),
          prescriptionId: cerisesEtSimilaires.id,
        }),
      { count: 4 }
    ),
    faker.helpers.multiple<Sample>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrix: 'A00HC',
          stage: 'STADE1',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
          company: oneOf(companies),
          prescriptionId: oignons.id,
        }),
      { count: 7 }
    ),
    faker.helpers.multiple<Sample>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrix: 'A013Q',
          stage: 'STADE1',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
          company: oneOf(companies),
          prescriptionId: lentilles.id,
        }),
      { count: 6 }
    ),
    faker.helpers.multiple<Sample>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrix: 'A0DFR',
          stage: 'STADE1',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
          company: oneOf(companies),
          prescriptionId: fevesDeSoja.id,
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
