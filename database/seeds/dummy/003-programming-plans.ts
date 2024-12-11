import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { setKnexInstance } from '../../../server/repositories/db';
import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import userRepository from '../../../server/repositories/userRepository';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';

export const validatedProgrammingPlanId = uuidv4();

exports.seed = async function (knex: Knex) {
  setKnexInstance(knex);

  const user = await userRepository.findOne('coordinateur.national@yopmail.fr');

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
