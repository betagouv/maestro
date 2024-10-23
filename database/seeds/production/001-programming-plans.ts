import fp from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { Users } from '../../../server/repositories/userRepository';
import { User } from '../../../shared/schema/User/User';

exports.seed = async function () {
  const user = await Users()
    .where('roles', '@>', ['NationalCoordinator'])
    .first()
    .then((_) => _ && User.parse(fp.omitBy(_, fp.isNil)));

  if (!user) {
    throw new Error('No NationalCoordinator found');
  }

  const validatedProgrammingPlanId = uuidv4();

  await ProgrammingPlans().insert([
    {
      id: validatedProgrammingPlanId,
      createdAt: new Date(),
      createdBy: user.id,
      status: 'Validated',
      year: 2024,
    },
  ]);
};
