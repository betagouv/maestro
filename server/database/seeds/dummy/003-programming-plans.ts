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
export const ppvClosedProgrammingPlanId =
  '95d0f5c9-8a48-4bfb-b896-08aae5a22be3';

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
        id: ppvClosedProgrammingPlanId,
        kinds: ['PPV'],
        contexts: ['Control', 'Surveillance'],
        createdAt: new Date(),
        createdBy: user.id,
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'Closed'
        })),
        year: new Date().getFullYear() - 1
      }),
      genProgrammingPlan({
        id: ppvValidatedProgrammingPlanId,
        kinds: ['PPV'],
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
        kinds: ['PFAS_EGGS', 'PFAS_MEAT'],
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
    [ppvClosedProgrammingPlanId].flatMap((id) =>
      RegionList.map((region) => ({
        programmingPlanId: id,
        region,
        status: 'Closed'
      }))
    )
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
