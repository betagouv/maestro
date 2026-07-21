import { omit } from 'lodash-es';
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
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import {
  ProgrammingSubPlanLocalStatus,
  ProgrammingSubPlans
} from '../../repositories/programmingSubPlanRepository';

export const seed = async (): Promise<void> => {
  const programmingPlans = [
    PPVClosedProgrammingPlanFixture,
    PPVValidatedProgrammingPlanFixture,
    PPVValidatedDromProgrammingPlanFixture,
    PPVInProgressProgrammingPlanFixture,
    PPVSubmittedProgrammingPlanFixture,
    DAOAValidatedProgrammingPlanFixture,
    DAOAInProgressProgrammingPlanFixture
  ];

  await ProgrammingPlans().insert(programmingPlans.map(formatProgrammingPlan));

  await ProgrammingSubPlans().insert(
    programmingPlans.flatMap((plan) =>
      plan.subPlans.map((subPlan) => ({
        ...omit(subPlan, ['regionalStatus', 'departmentalStatus']),
        programmingPlanId: plan.id
      }))
    )
  );

  await Promise.all(
    programmingPlans.flatMap((plan) =>
      plan.subPlans.flatMap((subPlan) => [
        ...subPlan.regionalStatus.map((regionalStatus) =>
          ProgrammingSubPlanLocalStatus().insert({
            ...regionalStatus,
            programmingSubPlanId: subPlan.id,
            department: 'None'
          })
        ),
        ...subPlan.departmentalStatus.map((departmentalStatus) =>
          ProgrammingSubPlanLocalStatus().insert({
            ...departmentalStatus,
            programmingSubPlanId: subPlan.id
          })
        )
      ])
    )
  );
};
