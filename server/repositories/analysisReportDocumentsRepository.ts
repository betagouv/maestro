import { kysely } from './kysely';

const insert = async (
  analysisId: string,
  documentId: string,
  trx = kysely
): Promise<void> => {
  await trx
    .insertInto('analysisReportDocuments')
    .values([
      {
        analysisId,
        documentId
      }
    ])
    .execute();
};

const deleteOne = async (
  analysisId: string,
  documentId: string,
  trx = kysely
): Promise<void> => {
  await trx
    .deleteFrom('analysisReportDocuments')
    .where('analysisId', '=', analysisId)
    .where('documentId', '=', documentId)
    .execute();
};

const findByAnalysisId = async (
  analysisId: string,
  trx = kysely
): Promise<string[]> => {
  const result = await trx
    .selectFrom('analysisReportDocuments')
    .select('documentId')
    .where('analysisId', '=', analysisId)
    .execute();

  return result.map(({ documentId }) => documentId);
};

export const analysisReportDocumentsRepository = {
  insert,
  deleteOne,
  findByAnalysisId
};
