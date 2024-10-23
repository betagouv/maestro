import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import userRepository from '../../../server/repositories/userRepository';

exports.seed = async function () {
  const user = await userRepository.findOne('coordinateur.national@pspc.fr');

  if (!user) {
    return;
  }

  const validatedProgrammingPlanId = uuidv4();

  await ProgrammingPlans().insert([
    {
      id: validatedProgrammingPlanId,
      createdAt: new Date(),
      createdBy: user.id,
      status: 'Validated',
      year: new Date().getFullYear(),
    },
  ]);
};
