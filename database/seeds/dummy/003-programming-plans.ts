import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import userRepository from '../../../server/repositories/userRepository';

exports.seed = async function () {
  const user = await userRepository.findOne('coordinateur.national@pspc.fr');

  if (!user) {
    return;
  }

  const validatedSurveyPlanId = uuidv4();
  const validatedControlPlanId = uuidv4();
  const inProgressSurveyPlanId = uuidv4();
  const inProgressControlPlanId = uuidv4();

  await ProgrammingPlans().insert([
    {
      id: validatedSurveyPlanId,
      title: 'Plan de surveillance',
      createdAt: new Date(),
      createdBy: user.id,
      kind: 'Surveillance',
      status: 'Validated',
    },
    {
      id: validatedControlPlanId,
      title: 'Plan de contrôle',
      createdAt: new Date(),
      createdBy: user.id,
      kind: 'Control',
      status: 'Validated',
    },
    {
      id: inProgressSurveyPlanId,
      title: 'Plan de surveillance',
      createdAt: new Date(),
      createdBy: user.id,
      kind: 'Surveillance',
      status: 'InProgress',
    },
    {
      id: inProgressControlPlanId,
      title: 'Plan de contrôle',
      createdAt: new Date(),
      createdBy: user.id,
      kind: 'Control',
      status: 'InProgress',
    },
  ]);
};
