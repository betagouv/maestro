import { DB, KyselyMaestro } from './kysely.type';
import { kysely } from './kysely';
import { Insertable } from 'kysely';

const insert = async (residueAnalytes: Insertable<DB['residueAnalytes']>[], trx: KyselyMaestro = kysely) => {

  await trx
    .insertInto('residueAnalytes')
    .values(residueAnalytes)
    .execute();
}

export const residueAnalyteRepository = {
  insert
}