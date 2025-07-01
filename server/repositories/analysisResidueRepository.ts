import { Insertable } from 'kysely';
import { kysely } from './kysely';
import { DB, KyselyMaestro } from './kysely.type';

const insert = async (
  analysisResidues: Insertable<DB['analysisResidues']>[],
  trx: KyselyMaestro = kysely
) => {
  await trx.insertInto('analysisResidues').values(analysisResidues).execute();
};

const deleteByAnalysisId = async (
  analysisId: string,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  await trx
    .deleteFrom('analysisResidues')
    .where('analysisId', '=', analysisId)
    .execute();
};

export const analysisResidueRepository = {
  insert,
  deleteByAnalysisId
};
