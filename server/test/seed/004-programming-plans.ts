import { ProgrammingPlanDomainFixtures } from 'maestro-shared/test/programmingPlanFixtures';
import { kysely } from '../../repositories/kysely';
import {
  formatProgrammingPlan,
  type ProgrammingPlanDBChecked,
  ProgrammingPlanLocalStatus,
  ProgrammingPlanNationalCoordinators,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';
import { toProgrammingPlanSettingsRow } from '../../repositories/programmingPlanSettingsRow';
import { ProgrammingSubPlansRaw } from '../../repositories/programmingSubPlanRepository';
import {
  DAOAInProgressProgrammingPlanFixtureDB,
  DAOAValidatedProgrammingPlanFixtureDB,
  PPVClosedProgrammingPlanFixtureDB,
  PPVInProgressProgrammingPlanFixtureDB,
  PPVSubmittedProgrammingPlanFixtureDB,
  PPVValidatedDromProgrammingPlanFixtureDB,
  PPVValidatedProgrammingPlanFixtureDB
} from '../programmingPlanFixtures';

export const seed = async (): Promise<void> => {
  await kysely
    .insertInto('programmingPlanDomains')
    .values(ProgrammingPlanDomainFixtures)
    .onConflict((oc) =>
      oc.column('id').doUpdateSet((eb) => ({
        label: eb.ref('excluded.label'),
        year: eb.ref('excluded.year')
      }))
    )
    .execute();

  const defaultProgrammingPlans: ProgrammingPlanDBChecked[] = [
    PPVClosedProgrammingPlanFixtureDB,
    PPVValidatedProgrammingPlanFixtureDB,
    PPVValidatedDromProgrammingPlanFixtureDB,
    PPVInProgressProgrammingPlanFixtureDB,
    PPVSubmittedProgrammingPlanFixtureDB,
    DAOAValidatedProgrammingPlanFixtureDB,
    DAOAInProgressProgrammingPlanFixtureDB
  ];
  await ProgrammingPlans().insert(
    defaultProgrammingPlans.map(formatProgrammingPlan)
  );

  await Promise.all(
    defaultProgrammingPlans.flatMap((plan) => [
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

  await ProgrammingPlanNationalCoordinators().insert(
    defaultProgrammingPlans.flatMap((plan) =>
      plan.nationalCoordinators.map(({ id }) => ({
        programmingPlanId: plan.id,
        userId: id
      }))
    )
  );

  await ProgrammingSubPlansRaw().insert(
    defaultProgrammingPlans.flatMap((plan) =>
      plan.subPlans.map((subPlan) => ({
        ...toProgrammingPlanSettingsRow(subPlan),
        programmingPlanId: plan.id
      }))
    )
  );
};
