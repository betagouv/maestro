import { sql } from 'kysely';
import { isNil, omitBy } from 'lodash-es';
import { FindLaboratoryOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryOptions';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

const laboratoryTable = 'laboratories';

export const Laboratories = () => db<Laboratory>(laboratoryTable);

const findUnique = async (id: string): Promise<Laboratory | undefined> => {
  console.info('Find laboratory by id', id);
  return Laboratories()
    .where({ id })
    .first()
    .then((_) => _ && Laboratory.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindLaboratoryOptions = {}
): Promise<Laboratory[]> => {
  console.info('Find laboratories', findOptions);

  let query = kysely.selectFrom('laboratories').selectAll();

  const needsAgreementJoin =
    !isNil(findOptions.programmingPlanId) || !isNil(findOptions.substanceKind);

  if (needsAgreementJoin) {
    query = query.innerJoin(
      'laboratoryAgreements',
      'laboratoryAgreements.laboratoryId',
      'laboratories.id'
    );
  }

  for (const option of FindLaboratoryOptions.keyof().options) {
    switch (option) {
      case 'programmingPlanId':
        if (!isNil(findOptions.programmingPlanId)) {
          query = query.where(
            'laboratoryAgreements.programmingPlanId' as any,
            '=',
            findOptions.programmingPlanId
          );
        }
        break;
      case 'substanceKind':
        if (!isNil(findOptions.substanceKind)) {
          query = query.where(
            'laboratoryAgreements.substanceKind' as any,
            '=',
            findOptions.substanceKind
          );
        }
        break;
      default:
        assertUnreachable(option);
    }
  }

  if (needsAgreementJoin) {
    query = query.distinct();
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
