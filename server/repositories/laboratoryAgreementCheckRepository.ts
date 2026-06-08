import type {
  LaboratoryAgreementCheckUpdate,
  LaboratoryAgreementRowKey
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

const findMany = async (
  year?: number | null
): Promise<LaboratoryAgreementRowKey[]> => {
  let query = kysely
    .selectFrom('laboratoryAgreementChecks')
    .innerJoin(
      'programmingPlans',
      'programmingPlans.id',
      'laboratoryAgreementChecks.programmingPlanId'
    )
    .select([
      'laboratoryAgreementChecks.programmingPlanId',
      'laboratoryAgreementChecks.programmingPlanKind',
      'laboratoryAgreementChecks.substanceKind'
    ]);

  if (year != null) {
    query = query.where('programmingPlans.year', '=', year);
  }

  return query.execute();
};

const upsert = async (
  update: LaboratoryAgreementCheckUpdate,
  userId: string
): Promise<LaboratoryAgreementRowKey[]> => {
  const { programmingPlanId, programmingPlanKind, substanceKind, checked } =
    update;

  if (checked) {
    await db('laboratory_agreement_checks')
      .insert({
        programmingPlanId,
        programmingPlanKind,
        substanceKind,
        checkedBy: userId,
        checkedAt: new Date()
      })
      .onConflict([
        'programming_plan_id',
        'programming_plan_kind',
        'substance_kind'
      ])
      .ignore();
  } else {
    await db('laboratory_agreement_checks')
      .where({ programmingPlanId, programmingPlanKind, substanceKind })
      .delete();
  }

  return findMany();
};

export const laboratoryAgreementCheckRepository = { findMany, upsert };
