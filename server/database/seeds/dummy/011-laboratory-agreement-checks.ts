import {
  PPVClosedSubPlanId,
  PPVInProgressSubPlanId,
  PPVSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import { AdminFixture } from 'maestro-shared/test/userFixtures';
import { knexInstance as db } from '../../../repositories/db';

export const seed = async () => {
  await db('laboratory_agreement_checks').insert(
    [PPVClosedSubPlanId, PPVSubPlanId, PPVInProgressSubPlanId].map(
      (programmingSubPlanId) => ({
        programming_sub_plan_id: programmingSubPlanId,
        substance_kind: 'Any',
        checked_by: AdminFixture.id,
        checked_at: new Date()
      })
    )
  );
};
