import { sql } from 'kysely';
import { isNil, omitBy } from 'lodash-es';
import { FindLaboratoryOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryOptions';
import {
  Laboratory,
  LaboratoryWithSacha,
  type SachaConfig
} from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  LaboratoryAgreement,
  type UpdateAgreementsInput
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type { SachaCommunicationMethod } from 'maestro-shared/schema/Laboratory/SachaCommunicationMethod';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import type { Laboratories as KyselyLaboratories } from './kysely.type';

const laboratoryTable = 'laboratories';

export const Laboratories = () => db<Laboratory>(laboratoryTable);

const buildCommunication = (
  row: KyselyLaboratories
): SachaConfig['communication'] => {
  if (row.sachaCommunicationMethod === null) return null;
  const method: SachaCommunicationMethod = row.sachaCommunicationMethod;
  switch (method) {
    case 'EMAIL':
      return {
        method: 'EMAIL',
        email: row.sachaEmail!,
        gpgPublicKey: row.sachaGpgPublicKey!
      };
    case 'SFTP':
      return { method: 'SFTP', sftpLogin: row.sachaSftpLogin! };
    default:
      return assertUnreachable(method);
  }
};

const toLaboratory = (row: KyselyLaboratories): LaboratoryWithSacha => {
  const sacha = row.legacyDai
    ? null
    : {
        activated: row.sachaActivated,
        sigle: row.sachaSigle,
        communication: buildCommunication(row)
      };
  return LaboratoryWithSacha.parse({
    id: row.id,
    shortName: row.shortName,
    name: row.name,
    address: row.address,
    postalCode: row.postalCode,
    city: row.city,
    emails: row.emails,
    programmingPlanIds: row.programmingPlanIds,
    legacyDai: row.legacyDai,
    sacha
  });
};

const findUnique = async (id: string): Promise<LaboratoryWithSacha> => {
  console.info('Find laboratory by id', id);
  const selectColumns = [
    'laboratories.id',
    'laboratories.shortName',
    'laboratories.name',
    'laboratories.address',
    'laboratories.postalCode',
    'laboratories.city',
    'laboratories.emails',
    'laboratories.emailsAnalysisResult',
    'laboratories.sachaEmail',
    'laboratories.sachaGpgPublicKey',
    'laboratories.sachaSigle',
    'laboratories.sachaSftpLogin',
    'laboratories.legacyDai',
    'laboratories.sachaActivated',
    'laboratories.sachaCommunicationMethod'
  ] as const;

  const row = await kysely
    .selectFrom('laboratories')
    .leftJoin(
      'laboratoryAgreements',
      'laboratoryAgreements.laboratoryId',
      'laboratories.id'
    )
    .select([
      ...selectColumns,
      sql<
        string[]
      >`array_remove(array_agg(DISTINCT "laboratory_agreements"."programming_plan_id"), NULL)`.as(
        'programmingPlanIds'
      )
    ])
    .groupBy([...selectColumns])
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
  return toLaboratory(row);
};

const findMany = async (
  findOptions: FindLaboratoryOptions = {}
): Promise<Laboratory[]> => {
  console.info('Find laboratories', findOptions);

  const selectColumns = [
    'laboratories.id',
    'laboratories.shortName',
    'laboratories.name',
    'laboratories.address',
    'laboratories.postalCode',
    'laboratories.city',
    'laboratories.emails',
    'laboratories.emailsAnalysisResult'
  ] as const;

  let query = kysely
    .selectFrom('laboratories')
    .leftJoin(
      'laboratoryAgreements',
      'laboratoryAgreements.laboratoryId',
      'laboratories.id'
    )
    .select([
      ...selectColumns,
      sql<
        string[]
      >`array_remove(array_agg(DISTINCT "laboratory_agreements"."programming_plan_id"), NULL)`.as(
        'programmingPlanIds'
      )
    ])
    .groupBy([...selectColumns])
    .orderBy('laboratories.name', 'asc');

  for (const option of FindLaboratoryOptions.keyof().options) {
    switch (option) {
      case 'programmingPlanIds':
        if (
          !isNil(findOptions.programmingPlanIds) &&
          findOptions.programmingPlanIds.length > 0
        ) {
          query = query.where(
            'laboratoryAgreements.programmingPlanId',
            'in',
            findOptions.programmingPlanIds
          );
        }
        break;
      case 'substanceKind':
        if (!isNil(findOptions.substanceKind)) {
          query = query.where(
            'laboratoryAgreements.substanceKind',
            '=',
            findOptions.substanceKind
          );
        }
        break;
      case 'programmingPlanKind':
        if (!isNil(findOptions.programmingPlanKind)) {
          query = query.where(
            'laboratoryAgreements.programmingPlanKind',
            '=',
            findOptions.programmingPlanKind
          );
        }
        break;
      default:
        assertUnreachable(option);
    }
  }

  const laboratories: Laboratory[] = await query.execute();

  return laboratories.map((l) => Laboratory.parse(omitBy(l, isNil)));
};

const findByEmailSender = async (email_result_analysis: string) => {
  return kysely
    .selectFrom('laboratories')
    .select('shortName')
    .where(({ eb, fn }) =>
      eb(sql.lit(email_result_analysis), '=', fn.any('emailsAnalysisResult'))
    )
    .executeTakeFirst();
};

const findAllAgreements = async (): Promise<LaboratoryAgreement[]> => {
  console.info('Find all laboratory agreements');

  const rows = await kysely
    .selectFrom('laboratoryAgreements')
    .innerJoin(
      'laboratories',
      'laboratories.id',
      'laboratoryAgreements.laboratoryId'
    )
    .innerJoin(
      'programmingPlans',
      'programmingPlans.id',
      'laboratoryAgreements.programmingPlanId'
    )
    .select([
      'laboratoryAgreements.laboratoryId',
      'laboratories.name as laboratoryName',
      'laboratories.shortName as laboratoryShortName',
      'laboratoryAgreements.programmingPlanId',
      'laboratoryAgreements.programmingPlanKind',
      'programmingPlans.year as programmingPlanYear',
      'laboratoryAgreements.substanceKind',
      'laboratoryAgreements.referenceLaboratory',
      'laboratoryAgreements.detectionAnalysis',
      'laboratoryAgreements.confirmationAnalysis'
    ])
    .orderBy('programmingPlans.year', 'desc')
    .orderBy('laboratories.name', 'asc')
    .execute();

  return rows.map((row) => LaboratoryAgreement.parse(row));
};

const upsertAgreementsForGroup = async (
  input: UpdateAgreementsInput
): Promise<LaboratoryAgreement[]> => {
  const { programmingPlanId, programmingPlanKind, substanceKind, agreements } =
    input;

  await db.transaction(async (trx) => {
    await trx('laboratory_agreements')
      .where({ programmingPlanId, substanceKind })
      .delete();

    if (agreements.length > 0) {
      await trx('laboratory_agreements').insert(
        agreements.map((a) => ({
          laboratoryId: a.laboratoryId,
          programmingPlanId,
          programmingPlanKind,
          substanceKind,
          referenceLaboratory: a.referenceLaboratory,
          detectionAnalysis: a.detectionAnalysis,
          confirmationAnalysis: a.confirmationAnalysis
        }))
      );
    }
  });

  return findAllAgreements();
};

export const laboratoryRepository = {
  findUnique,
  findMany,
  findByEmailSender,
  findAllAgreements,
  upsertAgreementsForGroup
};
