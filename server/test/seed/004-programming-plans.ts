import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
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
      PPVInProgressProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].map(formatProgrammingPlan)
  );

  await Promise.all(
    [
      PPVValidatedProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].flatMap((plan) =>
      plan.regionalStatus.map((regionalStatus) =>
        ProgrammingPlanLocalStatus().insert({
          ...regionalStatus,
          programmingPlanId: plan.id
        })
      )
    )
  );

  await ProgrammingPlanKinds().insert(
    [
      PPVValidatedProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].flatMap((plan) =>
      plan.kinds.map((kind: ProgrammingPlanKind) => ({
        programmingPlanId: plan.id,
        kind
      }))
    )
  );
};
