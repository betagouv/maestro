import { RegionList } from 'maestro-shared/referential/Region';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { v4 as uuidv4 } from 'uuid';
import {
  formatProgrammingPlan,
  ProgrammingPlans
} from '../../../repositories/programmingPlanRepository';
import { Users } from '../../../repositories/userRepository';

export const validatedProgrammingPlanId = uuidv4();

export const seed = async function () {
  const user = await Users()
    .where('email', 'coordinateur.national@maestro.beta.gouv.fr')
    .first();

  if (!user) {
    return;
  }

  await ProgrammingPlans().insert(
    formatProgrammingPlan(
      genProgrammingPlan({
        id: validatedProgrammingPlanId,
        createdAt: new Date(),
        createdBy: user.id,
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'Validated'
        })),
        year: new Date().getFullYear()
      })
    )
  );
};
