import { PPVSubPlanNumberPrefix } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { AdminFixture } from 'maestro-shared/test/userFixtures';
import { knexInstance as db } from '../../../repositories/db';
import { ProgrammingSubPlansRaw } from '../../../repositories/programmingSubPlanRepository';

export const seed = async () => {
  const ppvSubPlans = await ProgrammingSubPlansRaw()
    .select('id')
    .where('subPlanNumber', 'like', `${PPVSubPlanNumberPrefix}%`);

  await db('laboratory_agreement_checks').insert(
    ppvSubPlans.map(({ id }) => ({
      programming_sub_plan_id: id,
      substance_kind: 'Any',
      checked_by: AdminFixture.id,
      checked_at: new Date()
    }))
  );
};
