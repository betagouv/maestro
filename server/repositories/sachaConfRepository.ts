import { kysely } from './kysely';
import { SachaConf } from './kysely.type';

const get = async (trx = kysely): Promise<SachaConf> => {
  return await trx
    .selectFrom('sachaConf')
    .select(['versionReferenceStandardisees', 'versionReferencePrescripteur'])
    .executeTakeFirstOrThrow();
};

const update = async (
  newConf: Partial<SachaConf>,
  trx = kysely
): Promise<void> => {
  await trx.updateTable('sachaConf').set(newConf).execute();
};

export const sachaConfRepository = { get, update };
