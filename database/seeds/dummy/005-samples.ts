import { faker } from '@faker-js/faker';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import {
  formatPartialSample,
  Samples,
} from '../../../server/repositories/sampleRepository';
import { Users } from '../../../server/repositories/userRepository';
import { Regions } from '../../../shared/schema/Region';
import { genSample, oneOf } from '../../../shared/test/testFixtures';

exports.seed = async function () {
  const validatedSurveyProgrammingPlan = await ProgrammingPlans()
    .where({ title: 'Plan de surveillance', status: 'Validated' })
    .first();

  const sampler = await Users()
    .where({ roles: ['Sampler'] })
    .first();

  if (!validatedSurveyProgrammingPlan || !sampler) {
    return;
  }

  await Samples().insert(
    [
      faker.helpers.multiple(
        () => ({
          ...genSample(sampler.id, validatedSurveyProgrammingPlan.id),
          matrix: 'Abricots',
          stage: 'Avant récolte',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
        }),
        { count: 2 }
      ),
      faker.helpers.multiple(
        () => ({
          ...genSample(sampler.id, validatedSurveyProgrammingPlan.id),
          matrix: 'Avoine',
          stage: 'Post récolte',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
        }),
        { count: 8 }
      ),
      faker.helpers.multiple(
        () => ({
          ...genSample(sampler.id, validatedSurveyProgrammingPlan.id),
          matrix: 'Carottes',
          stage: 'Stockage',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
        }),
        { count: 3 }
      ),
      faker.helpers.multiple(
        () => ({
          ...genSample(sampler.id, validatedSurveyProgrammingPlan.id),
          matrix: 'Cerises',
          stage: 'Autre',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
        }),
        { count: 4 }
      ),
      faker.helpers.multiple(
        () => ({
          ...genSample(sampler.id, validatedSurveyProgrammingPlan.id),
          matrix: 'Choux-fleurs',
          stage: 'Stockage',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
        }),
        { count: 7 }
      ),
      faker.helpers.multiple(
        () => ({
          ...genSample(sampler.id, validatedSurveyProgrammingPlan.id),
          matrix: 'Lentilles sèches',
          stage: 'Stockage',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
        }),
        { count: 6 }
      ),
      faker.helpers.multiple(
        () => ({
          ...genSample(sampler.id, validatedSurveyProgrammingPlan.id),
          matrix: 'Soja',
          stage: 'Avant récolte',
          status: 'Sent',
          department: oneOf(Regions[sampler.region!].departments),
        }),
        { count: 6 }
      ),
    ]
      .flat()
      .map((_: any) => formatPartialSample(_))
  );
};
