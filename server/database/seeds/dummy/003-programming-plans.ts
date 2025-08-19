import { RegionList } from 'maestro-shared/referential/Region';
import {
  DAOAValidatedProgrammingPlanFixture,
  PFASValidatedProgrammingPlanFixture,
  PPVClosedProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlanRegionalStatus,
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

  await ProgrammingPlans().insert(
    [
      PPVClosedProgrammingPlanFixture,
      PPVValidatedProgrammingPlanFixture,
      PFASValidatedProgrammingPlanFixture,
      DAOAValidatedProgrammingPlanFixture
    ].map(formatProgrammingPlan)
  );

  await ProgrammingPlanRegionalStatus().insert(
    RegionList.map((region) => ({
      programmingPlanId: PPVClosedProgrammingPlanFixture.id,
      region,
      status: 'Closed'
    }))
  );
  await ProgrammingPlanRegionalStatus().insert(
    [
      PPVValidatedProgrammingPlanFixture.id,
      PFASValidatedProgrammingPlanFixture.id,
      DAOAValidatedProgrammingPlanFixture.id
    ].flatMap((id) =>
      RegionList.map((region) => ({
        programmingPlanId: id,
        region,
        status: 'Validated'
      }))
    )
  );
};
