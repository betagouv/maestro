import { sql } from 'kysely';
import { isNil, omitBy } from 'lodash-es';
import { FindLaboratoryOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryOptions';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import type { Laboratories as KyselyLaboratories } from './kysely.type';

const laboratoryTable = 'laboratories';

export const Laboratories = () => db<Laboratory>(laboratoryTable);

const findUnique = async (id: string): Promise<KyselyLaboratories> => {
  console.info('Find laboratory by id', id);

  return kysely
    .selectFrom('laboratories')
    .leftJoin(
      'laboratoryAgreements',
      'laboratoryAgreements.laboratoryId',
      'laboratories.id'
    )
    .select([
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
      sql<
        string[]
      >`array_remove(array_agg(DISTINCT "laboratory_agreements"."programming_plan_id"), NULL)`.as(
        'programmingPlanIds'
      )
    ])
    .groupBy([
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
      'laboratories.sachaSigle'
    ])
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
};

const findMany = async (
  findOptions: FindLaboratoryOptions = {}
): Promise<Laboratory[]> => {
  console.info('Find laboratories', findOptions);

  let query = kysely
    .selectFrom('laboratories')
    .leftJoin(
      'laboratoryAgreements',
      'laboratoryAgreements.laboratoryId',
      'laboratories.id'
    )
    .select([
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
      sql<
        string[]
      >`array_remove(array_agg(DISTINCT "laboratory_agreements"."programming_plan_id"), NULL)`.as(
        'programmingPlanIds'
      )
    ])
    .groupBy([
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
      'laboratories.sachaSigle'
    ])
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
          query = query
            .innerJoin(
              'programmingPlans',
              'programmingPlans.id',
              'laboratoryAgreements.programmingPlanId'
            )
            .innerJoin(
              'programmingPlanKinds',
              'programmingPlans.id',
              'programmingPlanKinds.programmingPlanId'
            )
            .where(
              'programmingPlanKinds.kind',
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
export const laboratoryRepository = {
  findUnique,
  findMany,
  findByEmailSender
};
