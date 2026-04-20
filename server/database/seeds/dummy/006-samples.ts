import { faker } from '@faker-js/faker';
import { type Region, Regions } from 'maestro-shared/referential/Region';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { FoieDeBovinValidatedPrescriptionFixture } from 'maestro-shared/test/prescriptionFixtures';
import {
  DAOAValidatedProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSample,
  genSampleItem
} from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import {
  Sampler1Fixture,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { Companies } from '../../../repositories/companyRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';
import { SampleItems } from '../../../repositories/sampleItemRepository';
import { sampleRepository } from '../../../repositories/sampleRepository';
import { Users } from '../../../repositories/userRepository';
import { CHARAL } from './001-companies';
import {
  abricotsEtSimilaires,
  avoineEtSimilaires,
  carottes,
  cerisesEtSimilaires,
  fevesDeSoja,
  lentilles,
  oignons
} from './005-prescriptions-ppv';

export const seed = async () => {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ id: PPVValidatedProgrammingPlanFixture.id })
    .first();

  const sampler = await Users()
    .where({ region: Sampler1Fixture.region })
    .andWhereRaw('roles @> ?', [['Sampler']])
    .first();

  const companies = await Companies();

  console.log('samples', validatedProgrammingPlan, sampler);

  if (!validatedProgrammingPlan || !sampler) {
    return;
  }

  const samples = [
    faker.helpers.multiple<SampleChecked>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrixKind: 'A0DVX',
          matrix: 'A0DVX',
          step: 'Sent',
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: abricotsEtSimilaires.id,
          region: sampler.region as Region
        }),
      { count: 2 }
    ),
    faker.helpers.multiple<SampleChecked>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrixKind: 'A000F',
          matrix: 'A000F',
          step: 'Sent',
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: avoineEtSimilaires.id,
          region: sampler.region as Region
        }),
      { count: 8 }
    ),
    faker.helpers.multiple<SampleChecked>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrixKind: 'A00QH',
          matrix: 'A00QH',
          step: 'Sent',
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: carottes.id,
          region: sampler.region as Region
        }),
      { count: 3 }
    ),
    faker.helpers.multiple<SampleChecked>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrixKind: 'A01GG',
          matrix: 'A01GG',
          step: 'Sent',
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: cerisesEtSimilaires.id,
          region: sampler.region as Region
        }),
      { count: 4 }
    ),
    faker.helpers.multiple<SampleChecked>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrixKind: 'A00HC',
          matrix: 'A00HC',
          step: 'Sent',
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: oignons.id,
          region: sampler.region as Region
        }),
      { count: 7 }
    ),
    faker.helpers.multiple<SampleChecked>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrixKind: 'A013Q',
          matrix: 'A013Q',
          step: 'Sent',
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: lentilles.id,
          region: sampler.region as Region
        }),
      { count: 6 }
    ),
    faker.helpers.multiple<SampleChecked>(
      () =>
        genCreatedSample({
          sampler,
          programmingPlanId: validatedProgrammingPlan.id,
          context: 'Control',
          matrixKind: 'A0DFR',
          matrix: 'A0DFR',
          step: 'Sent',
          department: oneOf(Regions[sampler.region as Region].departments),
          company: oneOf(companies),
          prescriptionId: fevesDeSoja.id,
          region: sampler.region as Region
        }),
      { count: 6 }
    ),
    faker.helpers.multiple<SampleChecked>(
      () => {
        const sampleId = uuidv4();
        return genCreatedSample({
          id: sampleId,
          sampler: SamplerDaoaFixture,
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          programmingPlanKind: 'DAOA_BOVIN',
          context: 'Surveillance',
          matrixKind: 'A01QX',
          matrix: 'A01XF#F28.A0C0S',
          step: 'Sent',
          department: '85',
          company: CHARAL,
          prescriptionId: FoieDeBovinValidatedPrescriptionFixture.id,
          region: '52' as Region,
          items: [
            genSampleItem({
              sampleId,
              itemNumber: 1,
              copyNumber: 1,
              substanceKind: 'Mono'
            }),
            genSampleItem({
              sampleId,
              itemNumber: 1,
              copyNumber: 2,
              substanceKind: 'Mono'
            }),
            genSampleItem({
              sampleId,
              itemNumber: 1,
              copyNumber: 3,
              substanceKind: 'Mono'
            }),
            genSampleItem({
              sampleId,
              itemNumber: 2,
              copyNumber: 1,
              substanceKind: 'Multi'
            }),
            genSampleItem({
              sampleId,
              itemNumber: 2,
              copyNumber: 2,
              substanceKind: 'Multi'
            }),
            genSampleItem({
              sampleId,
              itemNumber: 3,
              copyNumber: 1,
              substanceKind: 'Copper'
            })
          ]
        });
      },
      { count: 2 }
    )
  ];

  const sampleItems = samples
    .flat()
    .flatMap((sample: SampleChecked) => sample.items);

  for (const sample of samples.flat()) {
    await sampleRepository.insert(sample);
  }

  await SampleItems().insert(sampleItems);
};
