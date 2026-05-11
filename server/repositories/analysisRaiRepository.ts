import { jsonArrayFrom } from 'kysely/helpers/postgres';
import {
  AnalysisRai,
  type AnalysisRaiId,
  type NewAnalysisRai
} from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import { AnalysisRaiWithRelations } from 'maestro-shared/schema/AnalysisRai/AnalysisRaiWithRelations';
import type { FindAnalysisRaiOptions } from 'maestro-shared/schema/AnalysisRai/FindAnalysisRaiOptions';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { z } from 'zod';
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

const update = async (
  id: AnalysisRaiId,
  patch: Partial<
    Pick<AnalysisRai, 'state' | 'analysisId' | 'laboratoryId' | 'message'> & {
      payload: Record<string, unknown> | null;
    }
  >,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  await trx
    .updateTable('analysisRai')
    .set(patch)
    .where('id', '=', id)
    .execute();
};

const findManyWithRelations = async (
  options: FindAnalysisRaiOptions = {}
): Promise<{ rais: AnalysisRaiWithRelations[]; total: number }> => {
  const {
    states,
    sources,
    edi,
    laboratoryIds,
    receivedAtFrom,
    receivedAtTo,
    sampleIds,
    page = 1,
    perPage = defaultPerPage
  } = options;
  const offset = (page - 1) * perPage;

  const buildFilteredQuery = () => {
    let q = kysely
      .selectFrom('analysisRai')
      .leftJoin('analysis', 'analysis.id', 'analysisRai.analysisId')
      .leftJoin('samples', 'samples.id', 'analysis.sampleId')
      .leftJoin('sampleItems', (join) =>
        join
          .onRef('sampleItems.sampleId', '=', 'analysis.sampleId')
          .onRef('sampleItems.itemNumber', '=', 'analysis.itemNumber')
          .onRef('sampleItems.copyNumber', '=', 'analysis.copyNumber')
      )
      .leftJoin('laboratories', 'laboratories.id', 'analysisRai.laboratoryId');

    if (states?.length) {
      q = q.where('analysisRai.state', 'in', states);
    }
    if (sources?.length) {
      q = q.where('analysisRai.source', 'in', sources);
    }
    if (edi !== null && edi !== undefined) {
      q = q.where('analysisRai.edi', '=', edi);
    }
    if (laboratoryIds?.length) {
      q = q.where('analysisRai.laboratoryId', 'in', laboratoryIds);
    }
    if (receivedAtFrom) {
      q = q.where('analysisRai.receivedAt', '>=', receivedAtFrom);
    }
    if (receivedAtTo) {
      q = q.where('analysisRai.receivedAt', '<=', receivedAtTo);
    }
    if (sampleIds?.length) {
      q = q.where('samples.id', 'in', sampleIds);
    }

    return q;
  };

  const totalRow = await buildFilteredQuery()
    .select((eb) => eb.fn.count('analysisRai.id').as('total'))
    .executeTakeFirst();
  const total = Number(totalRow?.total ?? 0);

  if (total === 0) {
    return { rais: [], total: 0 };
  }

  const rows = await buildFilteredQuery()
    .selectAll('analysisRai')
    .select([
      'samples.id as sampleId',
      'samples.reference as sampleReference',
      'sampleItems.substanceKind as substanceKind',
      'laboratories.id as labId',
      'laboratories.shortName as labShortName',
      'laboratories.name as labName'
    ])
    .select((eb) =>
      jsonArrayFrom(
        eb
          .selectFrom('analysisRaiDocuments')
          .innerJoin(
            'documents',
            'documents.id',
            'analysisRaiDocuments.documentId'
          )
          .select(['documents.id', 'documents.filename', 'documents.kind'])
          .whereRef('analysisRaiDocuments.analysisRaiId', '=', 'analysisRai.id')
      ).as('documents')
    )
    .orderBy('analysisRai.receivedAt', 'desc')
    .limit(perPage)
    .offset(offset)
    .execute();

  const rais = z.array(AnalysisRaiWithRelations).parse(
    rows.map((row) => ({
      id: row.id,
      analysisId: row.analysisId,
      laboratoryId: row.laboratoryId,
      state: row.state,
      source: row.source,
      edi: row.edi,
      payload: row.payload,
      message: row.message,
      receivedAt: row.receivedAt,
      createdAt: row.createdAt,
      sample:
        row.sampleId != null && row.sampleReference != null
          ? { id: row.sampleId, reference: row.sampleReference }
          : null,
      sampleItem:
        row.substanceKind != null ? { substanceKind: row.substanceKind } : null,
      laboratory:
        row.labId != null && row.labShortName != null && row.labName != null
          ? { id: row.labId, shortName: row.labShortName, name: row.labName }
          : null,
      documents: row.documents
    }))
  );

  return { rais, total };
};

const findLinkedDocuments = async (
  analysisRaiId: AnalysisRaiId,
  trx: KyselyMaestro = kysely
): Promise<{ id: string; filename: string }[]> => {
  return trx
    .selectFrom('analysisRaiDocuments')
    .innerJoin('documents', 'documents.id', 'analysisRaiDocuments.documentId')
    .select(['documents.id', 'documents.filename'])
    .where('analysisRaiDocuments.analysisRaiId', '=', analysisRaiId)
    .execute();
};

const findById = async (
  id: AnalysisRaiId,
  trx: KyselyMaestro = kysely
): Promise<AnalysisRai | null> => {
  const row = await trx
    .selectFrom('analysisRai')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
  return AnalysisRai.nullable().parse(row ?? null);
};

export const analysisRaiRepository = {
  insert,
  linkDocuments,
  update,
  findById,
  findLinkedDocuments,
  findManyWithRelations
};
