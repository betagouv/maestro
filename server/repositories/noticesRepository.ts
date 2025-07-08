import { Notice } from 'maestro-shared/schema/Notice/Notice';
import { kysely } from './kysely';
import { Notices } from './kysely.type';

const update = async (notice: Notices, trx = kysely): Promise<void> => {
  await trx
    .updateTable('notices')
    .set(notice)
    .where('type', '=', notice.type)
    .execute();
};

const findByType = async (
  type: Notices['type'],
  trx = kysely
): Promise<Notice> => {
  return await trx
    .selectFrom('notices')
    .selectAll()
    .where('type', '=', type)
    .executeTakeFirstOrThrow();
};

export const noticesRepository = { update, findByType };
