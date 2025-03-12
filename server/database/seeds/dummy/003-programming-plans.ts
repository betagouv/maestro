import { RegionList } from 'maestro-shared/referential/Region';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanRegionalStatus,
  ProgrammingPlans
} from '../../../repositories/programmingPlanRepository';
import { Users } from '../../../repositories/userRepository';

export const ppvValidatedProgrammingPlanId =
  'f5d510ef-ab78-449a-acd6-392895a1994f';
export const pfasValidatedProgrammingPlanId =
  'd78fb3eb-1998-482b-9014-282d51ae30b8';

export const seed = async function () {
  const user = await Users()
    .where('email', 'coordinateur.national@maestro.beta.gouv.fr')
    .first();

  if (!user) {
    return;
  }

  await ProgrammingPlans().insert(
    [
      genProgrammingPlan({
        id: ppvValidatedProgrammingPlanId,
        domain: 'PPV',
        contexts: ['Control', 'Surveillance'],
        createdAt: new Date(),
        createdBy: user.id,
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'Validated'
        })),
        year: new Date().getFullYear()
      }),
      genProgrammingPlan({
        id: pfasValidatedProgrammingPlanId,
        domain: 'PFAS',
        contexts: ['Control'],
        createdAt: new Date(),
        createdBy: user.id,
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'Validated'
        })),
        year: new Date().getFullYear()
      })
    ].map(formatProgrammingPlan)
  );

  await ProgrammingPlanRegionalStatus().insert(
    [ppvValidatedProgrammingPlanId, pfasValidatedProgrammingPlanId].flatMap(
      (id) =>
        RegionList.map((region) => ({
          programmingPlanId: id,
          region,
          status: 'Validated'
        }))
    )
  );
};
