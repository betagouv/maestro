import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import userRepository from '../../../server/repositories/userRepository';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';

export const validatedProgrammingPlanId = uuidv4();

exports.seed = async function () {
  const user = await userRepository.findOne('coordinateur.national@maestro.fr');

  if (!user) {
    return;
  }

  await ProgrammingPlans().insert(
    genProgrammingPlan({
      id: validatedProgrammingPlanId,
      createdAt: new Date(),
      createdBy: user.id,
      status: 'Validated',
      statusDrom: 'Validated',
      year: new Date().getFullYear()
    })
  );
};
