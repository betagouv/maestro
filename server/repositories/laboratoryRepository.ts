import { sql, Selectable } from 'kysely';
import { isNil, omitBy } from 'lodash-es';
import { FindLaboratoryOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryOptions';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import { Laboratories as KyselyLaboratories } from './kysely.type';

const laboratoryTable = 'laboratories';

export const Laboratories = () => db<Laboratory>(laboratoryTable);

const findUnique = async (
  id: string
): Promise<Selectable<KyselyLaboratories> | undefined> => {
  console.info('Find laboratory by id', id);

  return kysely
    .selectFrom('laboratories')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
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
    .distinct()
    .selectAll();

  for (const option of FindLaboratoryOptions.keyof().options) {
    switch (option) {
      case 'programmingPlanId':
        if (!isNil(findOptions.programmingPlanId)) {
          query = query.where(
            'laboratoryAgreements.programmingPlanId',
            '=',
            findOptions.programmingPlanId
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
