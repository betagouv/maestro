import {
  LaboratoryAgreement,
  type LaboratoryAgreementUpdate
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

const findMany = async (): Promise<LaboratoryAgreement[]> => {
  console.info('Find all laboratory agreements');

  const rows = await kysely
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
    .orderBy('laboratories.name', 'asc')
    .execute();

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
