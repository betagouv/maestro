import type { FindLaboratoryAgreementsOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryAgreementsOptions';
import {
  LaboratoryAgreement,
  type LaboratoryAgreementUpdate
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

const findMany = async (
  opts?: FindLaboratoryAgreementsOptions
): Promise<LaboratoryAgreement[]> => {
  console.info('Find all laboratory agreements');

  let query = kysely
    .selectFrom('laboratoryAgreements')
    .innerJoin(
      'laboratories',
      'laboratories.id',
      'laboratoryAgreements.laboratoryId'
    )
    .innerJoin(
      'programmingSubPlans',
      'programmingSubPlans.id',
      'laboratoryAgreements.programmingSubPlanId'
    )
    .innerJoin(
      'programmingPlans',
      'programmingPlans.id',
      'programmingSubPlans.programmingPlanId'
    )
    .select([
      'laboratoryAgreements.laboratoryId',
      'laboratoryAgreements.programmingSubPlanId',
      'laboratoryAgreements.substanceKind',
      'laboratoryAgreements.referenceLaboratory',
      'laboratoryAgreements.detectionAnalysis',
      'laboratoryAgreements.confirmationAnalysis'
    ])
    .orderBy('laboratories.name', 'asc');

  if (opts?.year) {
    query = query.where('programmingPlans.year', '=', opts.year);
  }

  if (opts?.programmingSubPlanIds?.length) {
    query = query.where(
      'laboratoryAgreements.programmingSubPlanId',
      'in',
      opts.programmingSubPlanIds
    );
  }

  if (opts?.substanceKinds?.length) {
    query = query.where(
      'laboratoryAgreements.substanceKind',
      'in',
      opts.substanceKinds
    );
  }

  if (opts?.laboratoryIds?.length) {
    query = query.where(
      'laboratoryAgreements.laboratoryId',
      'in',
      opts.laboratoryIds
    );
  }

  if (opts?.matrixKinds?.length) {
    const matrixKinds = opts.matrixKinds;
    query = query.where(({ exists, selectFrom }) =>
      exists(
        selectFrom('prescriptions')
          .select('prescriptions.programmingSubPlanId')
          .whereRef(
            'prescriptions.programmingSubPlanId',
            '=',
            'laboratoryAgreements.programmingSubPlanId'
          )
          .where('prescriptions.matrixKind', 'in', matrixKinds)
      )
    );
  }

  if (opts?.withoutLab) {
    return [];
  }

  const rows = await query.execute();
  return rows.map((row) => LaboratoryAgreement.parse(row));
};

const upsertMany = async (
  laboratoryId: string,
  input: LaboratoryAgreementUpdate
): Promise<LaboratoryAgreement[]> => {
  const {
    laboratoryAgreementRowKey,
    referenceLaboratory,
    detectionAnalysis,
    confirmationAnalysis
  } = input;

  await db.transaction(async (trx) => {
    await trx('laboratory_agreements')
      .where({ laboratoryId, ...laboratoryAgreementRowKey })
      .delete();

    if (referenceLaboratory || detectionAnalysis || confirmationAnalysis) {
      await trx('laboratory_agreements').insert({
        laboratoryId,
        ...laboratoryAgreementRowKey,
        referenceLaboratory,
        detectionAnalysis,
        confirmationAnalysis
      });
    }
  });

  return findMany();
};

const copyFromPreviousYear = async (year: number): Promise<number> => {
  console.info('Copy laboratory agreements from previous year to', year);

  const inserted = await db.raw(
    `insert into laboratory_agreements
       (laboratory_id, programming_sub_plan_id, substance_kind,
        reference_laboratory, detection_analysis, confirmation_analysis)
     select distinct
       previous_agreement.laboratory_id,
       target.id,
       previous_agreement.substance_kind,
       previous_agreement.reference_laboratory,
       previous_agreement.detection_analysis,
       previous_agreement.confirmation_analysis
     from programming_sub_plans_raw target
     join programming_plans target_plan
       on target_plan.id = target.programming_plan_id
      and target_plan.year = ?
     join programming_plans previous_plan
       on previous_plan.year = ? - 1
      and previous_plan.title = target_plan.title
     join programming_sub_plans_raw previous
       on previous.programming_plan_id = previous_plan.id
      and previous.sub_plan_number = target.sub_plan_number
     join laboratory_agreements previous_agreement
       on previous_agreement.programming_sub_plan_id = previous.id
     where not exists (select 1
                       from laboratory_agreements existing
                       where existing.programming_sub_plan_id = target.id
                         and existing.laboratory_id = previous_agreement.laboratory_id
                         and existing.substance_kind = previous_agreement.substance_kind)`,
    [year, year]
  );

  return inserted.rowCount ?? 0;
};

export const laboratoryAgreementRepository = {
  findMany,
  upsertMany,
  copyFromPreviousYear
};
