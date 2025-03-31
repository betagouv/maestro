import { faker } from '@faker-js/faker';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { genCreatedSample } from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { Companies } from '../../../repositories/companyRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';
import { SampleItems } from '../../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples
} from '../../../repositories/sampleRepository';
import { Users } from '../../../repositories/userRepository';
import { DummyLaboratoryIds } from './002-laboratories';
import { validatedProgrammingPlanId } from './003-programming-plans';
import {
  abricotsEtSimilaires,
  avoineEtSimilaires,
  carottes,
  cerisesEtSimilaires,
  fevesDeSoja,
  lentilles,
  oignons
} from './004-prescriptions';

export const seed = async function () {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ id: validatedProgrammingPlanId })
    .first();

  const sampler = await Users()
    .where({ role: 'Sampler', region: Sampler1Fixture.region })
    .first();

  const companies = await Companies();

  console.log('samples', validatedProgrammingPlan, sampler);

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
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: abricotsEtSimilaires.id,
          laboratoryId: oneOf(DummyLaboratoryIds),
          region: sampler.region as Region
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
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: avoineEtSimilaires.id,
          laboratoryId: oneOf(DummyLaboratoryIds),
          region: sampler.region as Region
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
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: carottes.id,
          laboratoryId: oneOf(DummyLaboratoryIds),
          region: sampler.region as Region
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
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: cerisesEtSimilaires.id,
          laboratoryId: oneOf(DummyLaboratoryIds),
          region: sampler.region as Region
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
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: oignons.id,
          laboratoryId: oneOf(DummyLaboratoryIds),
          region: sampler.region as Region
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
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: lentilles.id,
          laboratoryId: oneOf(DummyLaboratoryIds),
          region: sampler.region as Region
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
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: fevesDeSoja.id,
          laboratoryId: oneOf(DummyLaboratoryIds),
          region: sampler.region as Region
        }),
      { count: 6 }
    )
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
