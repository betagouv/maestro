import { omit } from 'lodash-es';
import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  PPVClosedProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlans
} from '../../../repositories/programmingPlanRepository';
import {
  ProgrammingSubPlanLocalStatus,
  ProgrammingSubPlans
} from '../../../repositories/programmingSubPlanRepository';
import { Users } from '../../../repositories/userRepository';

export const seed = async () => {
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
    DAOAValidatedProgrammingPlanFixture,
    DAOAInProgressProgrammingPlanFixture
  ];

  await ProgrammingPlans().insert(plans.map(formatProgrammingPlan));

  await ProgrammingSubPlans().insert(
    plans.flatMap((plan) =>
      plan.subPlans.map((subPlan) => ({
        ...omit(subPlan, ['regionalStatus', 'departmentalStatus']),
        programmingPlanId: plan.id
      }))
    )
  );

  await ProgrammingSubPlanLocalStatus().insert(
    plans.flatMap((plan) =>
      plan.subPlans.flatMap((subPlan) => [
        ...subPlan.regionalStatus.map((regionalStatus) => ({
          programmingSubPlanId: subPlan.id,
          region: regionalStatus.region,
          status: regionalStatus.status
        })),
        ...subPlan.departmentalStatus.map((departmentalStatus) => ({
          programmingSubPlanId: subPlan.id,
          region: departmentalStatus.region,
          department: departmentalStatus.department,
          status: departmentalStatus.status
        }))
      ])
    )
  );
};
