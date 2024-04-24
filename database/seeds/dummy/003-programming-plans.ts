import { v4 as uuidv4 } from 'uuid';
import {
  ProgrammingPlans,
  ProgrammingPlansRegions,
} from '../../../server/repositories/programmingPlanRepository';
import userRepository from '../../../server/repositories/userRepository';
import { ProgrammingPlanStatus } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionList } from '../../../shared/schema/Region';

exports.seed = async function () {
  const user = await userRepository.findOne('coordinateur.national@pspc.fr');

  if (!user) {
    return;
  }

  const surveyPlanId = uuidv4();
  const controlPlanId = uuidv4();

  await ProgrammingPlans().insert([
    {
      id: surveyPlanId,
      title: 'Plan de surveillance',
      createdAt: new Date(),
      createdBy: user.id,
      kind: 'Surveillance',
    },
    {
      id: controlPlanId,
      title: 'Plan de contrôle',
      createdAt: new Date(),
      createdBy: user.id,
      kind: 'Control',
    },
  ]);

  await ProgrammingPlansRegions().insert([
    ...RegionList.map((region) => ({
      programmingPlanId: surveyPlanId,
      region,
      status: 'ToValidate' as ProgrammingPlanStatus,
    })),
    ...RegionList.map((region) => ({
      programmingPlanId: controlPlanId,
      region,
      status: 'ToValidate' as ProgrammingPlanStatus,
    })),
  ]);
};
