import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import {
  formatPartialSample,
  Samples,
} from '../../../server/repositories/sampleRepository';
import { Users } from '../../../server/repositories/userRepository';
import { genSample } from '../../../shared/test/testFixtures';

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

  // prettier-ignore
  await Samples().insert([
    new Array(2).fill({}).map(_ => ({...genSample(sampler.id, validatedSurveyProgrammingPlan.id), matrix: 'Abricots', stage: 'Avant récolte', status: 'Sent'})),
    new Array(3).fill({}).map(_ => ({...genSample(sampler.id, validatedSurveyProgrammingPlan.id), matrix: 'Carottes', stage: 'Stockage', status: 'Sent'})),
    new Array(4).fill({}).map(_ => ({...genSample(sampler.id, validatedSurveyProgrammingPlan.id), matrix: 'Cerises', stage: 'Autre', status: 'Sent'})),
    ]
      .flat()
      .map((_ : any) => formatPartialSample(_))
  );
};
