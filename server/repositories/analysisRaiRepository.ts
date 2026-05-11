import type {
  AnalysisRaiId,
  NewAnalysisRai
} from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import { kysely } from './kysely';
import type { KyselyMaestro } from './kysely.type';

const insert = async (
  rai: NewAnalysisRai,
  trx: KyselyMaestro = kysely
): Promise<AnalysisRaiId> => {
  const result = await trx
    .insertInto('analysisRai')
    .values({
      analysisId: rai.analysisId,
      laboratoryId: rai.laboratoryId,
      state: rai.state,
      source: rai.source,
      edi: rai.edi,
      payload: rai.payload as Record<string, unknown> | null,
      message: rai.message,
      receivedAt: rai.receivedAt
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  return result.id;
};

const linkDocuments = async (
  analysisRaiId: AnalysisRaiId,
  documentIds: string[],
  trx: KyselyMaestro = kysely
): Promise<void> => {
  if (documentIds.length === 0) return;
  await trx
    .insertInto('analysisRaiDocuments')
    .values(documentIds.map((documentId) => ({ analysisRaiId, documentId })))
    .execute();
};

export const analysisRaiRepository = {
  insert,
  linkDocuments
};
