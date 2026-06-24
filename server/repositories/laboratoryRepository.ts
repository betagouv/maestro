import { sql } from 'kysely';
import { isNil, omitBy } from 'lodash-es';
import { FindLaboratoryOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryOptions';
import {
  Laboratory,
  type LaboratoryConfigUpdate,
  LaboratoryWithSacha,
  type SachaConfig
} from 'maestro-shared/schema/Laboratory/Laboratory';
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
        recipientEmail: row.sachaRecipientEmail!,
        gpgEmail: row.sachaGpgEmail,
        gpgPublicKey: row.sachaGpgPublicKey
      };
    case 'SFTP':
      return { method: 'SFTP', sftpLogin: row.sachaSftpLogin! };
    default:
      return assertUnreachable(method);
  }
};

const findUnique = async (id: string): Promise<LaboratoryWithSacha> => {
  console.info('Find laboratory by id', id);
  const row = await kysely
    .selectFrom('laboratories')
    .leftJoin(
      'laboratoryAgreements',
      'laboratoryAgreements.laboratoryId',
      'laboratories.id'
    )
    .leftJoin(
      'programmingSubPlans',
      'programmingSubPlans.id',
      'laboratoryAgreements.programmingSubPlanId'
    )
    .selectAll('laboratories')
    .select(
      sql<
        string[]
      >`array_remove(array_agg(DISTINCT "programming_sub_plans"."programming_plan_id"), NULL)`.as(
        'programmingPlanIds'
      )
    )
    .groupBy('laboratories.id')
    .where('laboratories.id', '=', id)
    .executeTakeFirstOrThrow();

  const sacha = row.legacyDai
    ? null
    : {
        activated: row.sachaActivated,
        sigle: row.sachaSigle,
        communication: buildCommunication(row)
      };
  return LaboratoryWithSacha.parse({
    ...row,
    emails: (row.emails ?? []).filter((e): e is string => e !== null),
    emailsAnalysisResult: (row.emailsAnalysisResult ?? []).filter(
      (e): e is string => e !== null
    ),
    sacha
  });
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
    'laboratories.billingAddress',
    'laboratories.billingPostalCode',
    'laboratories.billingCity',
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
    .leftJoin(
      'programmingSubPlans',
      'programmingSubPlans.id',
      'laboratoryAgreements.programmingSubPlanId'
    )
    .select([
      ...selectColumns,
      sql<
        string[]
      >`array_remove(array_agg(DISTINCT "programming_sub_plans"."programming_plan_id"), NULL)`.as(
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
            'programmingSubPlans.programmingPlanId',
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
      case 'programmingSubPlanId':
        if (!isNil(findOptions.programmingSubPlanId)) {
          query = query.where(
            'laboratoryAgreements.programmingSubPlanId',
            '=',
            findOptions.programmingSubPlanId
          );
        }
        break;
      case 'subPlanNumber':
        if (!isNil(findOptions.subPlanNumber)) {
          query = query.where(
            'programmingSubPlans.subPlanNumber',
            '=',
            findOptions.subPlanNumber
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

const buildSachaFields = (sacha: SachaConfig | null) => {
  if (sacha === null) {
    return {
      sachaActivated: false,
      sachaSigle: null,
      sachaCommunicationMethod: null,
      sachaRecipientEmail: null,
      sachaGpgEmail: null,
      sachaGpgPublicKey: null,
      sachaSftpLogin: null
    } as const;
  }

  const communication = sacha.communication;
  if (communication === null) {
    return {
      sachaActivated: sacha.activated,
      sachaSigle: sacha.sigle,
      sachaCommunicationMethod: null,
      sachaRecipientEmail: null,
      sachaGpgEmail: null,
      sachaGpgPublicKey: null,
      sachaSftpLogin: null
    } as const;
  }

  switch (communication.method) {
    case 'EMAIL':
      return {
        sachaActivated: sacha.activated,
        sachaSigle: sacha.sigle,
        sachaCommunicationMethod: 'EMAIL' as const,
        sachaRecipientEmail: communication.recipientEmail,
        sachaGpgEmail: communication.gpgEmail ?? null,
        sachaGpgPublicKey: communication.gpgPublicKey ?? null,
        sachaSftpLogin: null
      };
    case 'SFTP':
      return {
        sachaActivated: sacha.activated,
        sachaSigle: sacha.sigle,
        sachaCommunicationMethod: 'SFTP' as const,
        sachaRecipientEmail: null,
        sachaGpgEmail: null,
        sachaGpgPublicKey: null,
        sachaSftpLogin: communication.sftpLogin
      };
    default:
      return assertUnreachable(communication);
  }
};

const updateConfig = async (
  id: string,
  payload: LaboratoryConfigUpdate
): Promise<void> => {
  console.info('Update laboratory config', id);

  await kysely
    .updateTable('laboratories')
    .set({
      emails: payload.emails,
      emailsAnalysisResult: payload.emailsAnalysisResult,
      legacyDai: payload.legacyDai,
      ...buildSachaFields(payload.sacha)
    })
    .where('id', '=', id)
    .execute();
};

const findByEmailSender = async (email_result_analysis: string) => {
  return kysely
    .selectFrom('laboratories')
    .select(['id', 'shortName'])
    .where(({ eb, fn }) =>
      eb(sql.lit(email_result_analysis), '=', fn.any('emailsAnalysisResult'))
    )
    .executeTakeFirst();
};

export const laboratoryRepository = {
  findUnique,
  findMany,
  updateConfig,
  findByEmailSender
};
