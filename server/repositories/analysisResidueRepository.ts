import { DB, KyselyMaestro } from './kysely.type';
import { kysely } from './kysely';
import { Insertable } from 'kysely';

const insert = async (analysisResidues: Insertable<DB['analysisResidues']>[], trx: KyselyMaestro = kysely) => {

  await trx
    .insertInto('analysisResidues')
    .values(analysisResidues)
    .execute();
}

export const analysisResidueRepository = {
  insert
}