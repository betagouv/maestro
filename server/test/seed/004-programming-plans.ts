import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanKinds,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(
    [
      PPVValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].map(formatProgrammingPlan)
  );

  await Promise.all(
    PPVValidatedProgrammingPlanFixture.regionalStatus.map((regionalStatus) =>
      ProgrammingPlanLocalStatus().insert({
        ...regionalStatus,
        programmingPlanId: PPVValidatedProgrammingPlanFixture.id
      })
    )
  );

  await Promise.all(
    DAOAInProgressProgrammingPlanFixture.regionalStatus.map((regionalStatus) =>
      ProgrammingPlanLocalStatus().insert({
        ...regionalStatus,
        programmingPlanId: DAOAInProgressProgrammingPlanFixture.id
      })
    )
  );

  await ProgrammingPlanKinds().insert(
    [
      PPVValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].flatMap((plan) =>
      plan.kinds.map((kind: ProgrammingPlanKind) => ({
        programmingPlanId: plan.id,
        kind
      }))
    )
  );
};
