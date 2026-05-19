import {
  PPVClosedProgrammingPlanId,
  PPVInProgressProgrammingPlanId,
  PPVValidatedProgrammingPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import { AdminFixture } from 'maestro-shared/test/userFixtures';
import { knexInstance as db } from '../../../repositories/db';

const PPVProgrammingPlanIds = [
  PPVClosedProgrammingPlanId,
  PPVValidatedProgrammingPlanId,
  PPVInProgressProgrammingPlanId
];

export const seed = async () => {
  await db('laboratory_agreement_checks').insert(
    PPVProgrammingPlanIds.map((programmingPlanId) => ({
      programming_plan_id: programmingPlanId,
      programming_plan_kind: 'PPV',
      substance_kind: 'Any',
      checked_by: AdminFixture.id,
      checked_at: new Date()
    }))
  );
};
