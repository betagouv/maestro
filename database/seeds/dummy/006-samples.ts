import { faker } from '@faker-js/faker';
import { Companies } from '../../../server/repositories/companyRepository';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { SampleItems } from '../../../server/repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples
} from '../../../server/repositories/sampleRepository';
import { Users } from '../../../server/repositories/userRepository';
import { Region, Regions } from '../../../shared/referential/Region';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { genCreatedSample } from '../../../shared/test/sampleFixtures';
import { oneOf } from '../../../shared/test/testFixtures';
import { Sampler1Fixture } from '../test/001-users';
import { DummyLaboratoryIds } from './002-laboratories';
import {
  abricotsEtSimilaires,
  avoineEtSimilaires,
  carottes,
  cerisesEtSimilaires,
  fevesDeSoja,
  lentilles,
  oignons
} from './004-prescriptions';
import { Knex } from 'knex';
import { setKnexInstance } from '../../../server/repositories/db';
exports.seed = async function (knex: Knex) {
  setKnexInstance(knex)

  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ status: 'Validated' })
    .first();

  const sampler = await Users()
    .where({ roles: ['Sampler'], region: Sampler1Fixture.region })
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
