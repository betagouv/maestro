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
    .select([
      'laboratoryAgreementChecks.programmingSubPlanId',
      'laboratoryAgreementChecks.substanceKind'
    ]);

  if (year != null) {
    query = query
      .innerJoin(
        'programmingSubPlans',
        'programmingSubPlans.id',
        'laboratoryAgreementChecks.programmingSubPlanId'
      )
      .innerJoin(
        'programmingPlans',
        'programmingPlans.id',
        'programmingSubPlans.programmingPlanId'
      )
      .where('programmingPlans.year', '=', year);
  }

  return query.execute();
};

const upsert = async (
  update: LaboratoryAgreementCheckUpdate,
  userId: string
): Promise<LaboratoryAgreementRowKey[]> => {
  const { programmingSubPlanId, substanceKind, checked } = update;

  if (checked) {
    await db('laboratory_agreement_checks')
      .insert({
        programmingSubPlanId,
        substanceKind,
        checkedBy: userId,
        checkedAt: new Date()
      })
      .onConflict(['programming_sub_plan_id', 'substance_kind'])
      .ignore();
  } else {
    await db('laboratory_agreement_checks')
      .where({ programmingSubPlanId, substanceKind })
      .delete();
  }

  return findMany();
};

export const laboratoryAgreementCheckRepository = { findMany, upsert };
