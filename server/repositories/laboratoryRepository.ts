import { sql, Selectable } from 'kysely';
import { isNil, omitBy } from 'lodash-es';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
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

const findMany = async (): Promise<Laboratory[]> => {
  console.info('Find laboratories');
  return Laboratories().then((laboratories) =>
    laboratories.map((_) => Laboratory.parse(omitBy(_, isNil)))
  );
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
