import type { Insertable } from 'kysely';
import { kysely } from './kysely';
import type { DB, KyselyMaestro } from './kysely.type';

const insert = async (
  residueAnalytes: Insertable<DB['residueAnalytes']>[],
  trx: KyselyMaestro = kysely
) => {
  await trx.insertInto('residueAnalytes').values(residueAnalytes).execute();
};

export const residueAnalyteRepository = {
  insert
};
