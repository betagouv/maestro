import { RegionList } from 'maestro-shared/referential/Region';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanRegionalStatus,
  ProgrammingPlans
} from '../../../repositories/programmingPlanRepository';
import { Users } from '../../../repositories/userRepository';

export const validatedProgrammingPlanId =
  'f5d510ef-ab78-449a-acd6-392895a1994f';

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

  await ProgrammingPlanRegionalStatus().insert(
    RegionList.map((region) => ({
      programmingPlanId: validatedProgrammingPlanId,
      region,
      status: 'Validated'
    }))
  );
};
