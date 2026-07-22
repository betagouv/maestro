import { hasSentOnward } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
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

  // Dummy plans are meant to already be at rest in their fixture's status
  // (e.g. 'Validated' plans should display as already sent, not "à envoyer"),
  // so sentAt must be backfilled here exactly like a real transition would set
  // it — otherwise every echelon looks like it's still waiting to be sent.
  await ProgrammingPlanLocalStatus().insert(
    plans.map((plan) => ({
      programmingPlanId: plan.id,
      region: 'None' as const,
      department: 'None' as const,
      status: plan.nationalStatus.status,
      sentAt: hasSentOnward(
        'National',
        plan.distributionKind,
        plan.nationalStatus.status
      )
        ? plan.createdAt
        : null
    }))
  );

  await ProgrammingPlanLocalStatus().insert(
    plans.flatMap((plan) =>
      plan.regionalStatus.map((regionalStatus) => ({
        programmingPlanId: plan.id,
        region: regionalStatus.region,
        status: regionalStatus.status,
        sentAt: hasSentOnward(
          'Regional',
          plan.distributionKind,
          regionalStatus.status
        )
          ? plan.createdAt
          : null
      }))
    )
  );

  await ProgrammingPlanLocalStatus().insert(
    plans.flatMap((plan) =>
      plan.departmentalStatus?.map((departmentalStatus) => ({
        programmingPlanId: plan.id,
        region: departmentalStatus.region,
        department: departmentalStatus.department,
        status: departmentalStatus.status,
        sentAt: hasSentOnward(
          'Departmental',
          plan.distributionKind,
          departmentalStatus.status
        )
          ? plan.createdAt
          : null
      }))
    )
  );

  await ProgrammingSubPlans().insert(
    plans.flatMap((plan) =>
      plan.subPlans.map((subPlan) => ({
        ...subPlan,
        programmingPlanId: plan.id
      }))
    )
  );
};
