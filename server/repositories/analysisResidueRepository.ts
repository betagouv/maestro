import { Insertable } from 'kysely';
import { kysely } from './kysely';
import { DB, KyselyMaestro } from './kysely.type';

const insert = async (
  analysisResidues: Insertable<DB['analysisResidues']>[],
  trx: KyselyMaestro = kysely
) => {
  await trx.insertInto('analysisResidues').values(analysisResidues).execute();
};

export const analysisResidueRepository = {
  insert
};
