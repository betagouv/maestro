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
    .select([
      'laboratoryAgreements.laboratoryId',
      'laboratoryAgreements.programmingPlanId',
      'laboratoryAgreements.programmingPlanKind',
      'laboratoryAgreements.substanceKind',
      'laboratoryAgreements.referenceLaboratory',
      'laboratoryAgreements.detectionAnalysis',
      'laboratoryAgreements.confirmationAnalysis'
    ])
    .orderBy('laboratories.name', 'asc');

  if (opts?.programmingPlanKinds?.length) {
    query = query.where(
      'laboratoryAgreements.programmingPlanKind',
      'in',
      opts.programmingPlanKinds
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
          .select('prescriptions.programmingPlanId')
          .whereRef(
            'prescriptions.programmingPlanId',
            '=',
            'laboratoryAgreements.programmingPlanId'
          )
          .whereRef(
            'prescriptions.programmingPlanKind',
            '=',
            'laboratoryAgreements.programmingPlanKind'
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

export const laboratoryAgreementRepository = {
  findMany,
  upsertMany
};
