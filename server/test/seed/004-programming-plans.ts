import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  PPVClosedProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVSubmittedProgrammingPlanFixture,
  PPVValidatedDromProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanLocalStatus,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import { ProgrammingSubPlans } from '../../repositories/programmingSubPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(
    [
      PPVClosedProgrammingPlanFixture,
      PPVValidatedProgrammingPlanFixture,
      PPVValidatedDromProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      PPVSubmittedProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].map(formatProgrammingPlan)
  );

  await Promise.all(
    [
      PPVClosedProgrammingPlanFixture,
      PPVValidatedProgrammingPlanFixture,
      PPVValidatedDromProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      PPVSubmittedProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].flatMap((plan) => [
      ProgrammingPlanLocalStatus().insert({
        ...plan.nationalStatus,
        programmingPlanId: plan.id,
        region: 'None',
        department: 'None'
      }),
      ...plan.regionalStatus.map((regionalStatus) =>
        ProgrammingPlanLocalStatus().insert({
          ...regionalStatus,
          programmingPlanId: plan.id
        })
      )
    ])
  );

  await ProgrammingSubPlans().insert(
    [
      PPVClosedProgrammingPlanFixture,
      PPVValidatedProgrammingPlanFixture,
      PPVValidatedDromProgrammingPlanFixture,
      PPVInProgressProgrammingPlanFixture,
      PPVSubmittedProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture,
      DAOAInProgressProgrammingPlanFixture
    ].flatMap((plan) =>
      plan.subPlans.map((subPlan) => ({
        ...subPlan,
        programmingPlanId: plan.id
      }))
    )
  );
};
