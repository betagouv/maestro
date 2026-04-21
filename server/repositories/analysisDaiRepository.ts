import type {
  AnalysisDai,
  AnalysisDaiId
} from 'maestro-shared/schema/AnalysisDai/AnalysisDai';
import type { OmitDistributive } from 'maestro-shared/utils/typescript';
import { kysely } from './kysely';
import type { KyselyMaestro } from './kysely.type';

type AnalysisDaiModel = AnalysisDai;

const insert = async (
  analysisId: string,
  trx: KyselyMaestro = kysely
): Promise<AnalysisDaiId> => {
  console.info('Insert analysisDai for analysis', analysisId);
  const result = await trx
    .insertInto('analysisDai')
    .values({ analysisId, state: 'PENDING' })
    .returning('id')
    .executeTakeFirstOrThrow();
  return result.id;
};

const claimPending = async (
  limit: number,
  trx: KyselyMaestro
): Promise<Pick<AnalysisDaiModel, 'analysisId' | 'id'>[]> => {
  return await trx
    .selectFrom('analysisDai')
    .selectAll()
    .where('state', '=', 'PENDING')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute();
};

const linkDocuments = async (
  id: AnalysisDaiId,
  documentIdsToLink: string[],
  trx: KyselyMaestro = kysely
): Promise<void> => {
  if (documentIdsToLink.length > 0) {
    await trx
      .insertInto('analysisDaiDocuments')
      .values(
        documentIdsToLink.map((documentId) => ({
          analysisDaiId: id,
          documentId
        }))
      )
      .execute();
  }
};

const update = async (
  dai: OmitDistributive<AnalysisDai, 'createdAt' | 'sentAt' | 'analysisId'>,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  await trx
    .updateTable('analysisDai')
    .set({ ...dai, sentAt: new Date() })
    .where('id', '=', dai.id)
    .execute();
};

export const analysisDaiRepository = {
  insert,
  claimPending,
  linkDocuments,
  update
};
