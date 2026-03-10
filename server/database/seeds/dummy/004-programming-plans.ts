import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVClosedProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanKinds,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../../repositories/programmingPlanRepository';
import { Users } from '../../../repositories/userRepository';

export const seed = async function () {
  const user = await Users()
    .where('email', 'coordinateur.national@maestro.beta.gouv.fr')
    .first();

  if (!user) {
    return;
  }

  const plans = [
    PPVClosedProgrammingPlanFixture,
    PPVValidatedProgrammingPlanFixture,
    PPVInProgressProgrammingPlanFixture,
    DAOAInProgressProgrammingPlanFixture
  ];

  await ProgrammingPlans().insert(plans.map(formatProgrammingPlan));

  await ProgrammingPlanLocalStatus().insert(
    plans.flatMap((plan) =>
      plan.regionalStatus.map((regionalStatus) => ({
        programmingPlanId: plan.id,
        region: regionalStatus.region,
        status: regionalStatus.status
      }))
    )
  );

  await ProgrammingPlanKinds().insert(
    plans.flatMap((plan) =>
      plan.kinds.map((kind: ProgrammingPlanKind) => ({
        programmingPlanId: plan.id,
        kind
      }))
    )
  );
};
