import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  PPVClosedProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../../repositories/programmingPlanRepository';
import { ProgrammingSubPlans } from '../../../repositories/programmingSubPlanRepository';
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

  await ProgrammingPlanLocalStatus().insert(
    plans.flatMap((plan) =>
      plan.regionalStatus.map((regionalStatus) => ({
        programmingPlanId: plan.id,
        region: regionalStatus.region,
        status: regionalStatus.status
      }))
    )
  );

  await ProgrammingPlanLocalStatus().insert(
    plans.flatMap((plan) =>
      plan.departmentalStatus?.map((departmentalStatus) => ({
        programmingPlanId: plan.id,
        region: departmentalStatus.region,
        department: departmentalStatus.department,
        status: departmentalStatus.status
      }))
    )
  );

  await ProgrammingSubPlans().insert(
    plans.flatMap((plan) =>
      plan.subPlans.map((subPlan) => ({
        id: subPlan.id,
        programmingPlanId: plan.id,
        codeNat: subPlan.codeNat,
        stages: subPlan.stages,
        label: subPlan.label,
        analysisPermissionRole: subPlan.analysisPermissionRole,
        contactListId: subPlan.contactListId,
        withSacha: subPlan.withSacha
      }))
    )
  );
};
