import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import userRepository from '../../../server/repositories/userRepository';

export const validatedProgrammingPlanId = uuidv4();

exports.seed = async function () {
  const user = await userRepository.findOne('coordinateur.national@maestro.fr');

  if (!user) {
    return;
  }

  await ProgrammingPlans().insert([
    {
      id: validatedProgrammingPlanId,
      createdAt: new Date(),
      createdBy: user.id,
      status: 'Validated',
      year: new Date().getFullYear()
    }
  ]);
};
