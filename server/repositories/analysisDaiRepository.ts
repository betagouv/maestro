import { sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type {
  AnalysisDai,
  AnalysisDaiId
} from 'maestro-shared/schema/AnalysisDai/AnalysisDai';
import { AnalysisDaiAnalysisGroup } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiAnalysisGroup';
import type { FindAnalysisDaiOptions } from 'maestro-shared/schema/AnalysisDai/FindAnalysisDaiOptions';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
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

const findManyGrouped = async (
  options: FindAnalysisDaiOptions = {}
): Promise<{ analyses: AnalysisDaiAnalysisGroup[]; total: number }> => {
  const {
    states,
    sentDateFrom,
    sentDateTo,
    laboratoryIds,
    edi,
    sentMethods,
    sampleIds,
    page = 1,
    perPage = defaultPerPage
  } = options;
  const offset = (page - 1) * perPage;

  const buildFilteredQuery = () => {
    let q = kysely
      .selectFrom('analysisDai')
      .innerJoin('analysis', 'analysis.id', 'analysisDai.analysisId')
      .innerJoin('sampleItems', (join) =>
        join
          .onRef('sampleItems.sampleId', '=', 'analysis.sampleId')
          .onRef('sampleItems.itemNumber', '=', 'analysis.itemNumber')
          .onRef('sampleItems.copyNumber', '=', 'analysis.copyNumber')
      )
      .innerJoin('samples', 'samples.id', 'analysis.sampleId')
      .leftJoin('laboratories', 'laboratories.id', 'sampleItems.laboratoryId')
      //On enlève les DAIs des analyses qui ont DAI plus récente
      .where(({ eb }) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom('analysisDai as later_dai')
              .whereRef('later_dai.analysisId', '=', 'analysisDai.analysisId')
              .whereRef('later_dai.createdAt', '>', 'analysisDai.createdAt')
              .select('later_dai.id')
          )
        )
      );

    if (states?.length) {
      q = q.where('analysisDai.state', 'in', states);
    }
    if (sentDateFrom) {
      q = q.where('analysisDai.sentAt', '>=', sentDateFrom);
    }
    if (sentDateTo) {
      q = q.where('analysisDai.sentAt', '<=', sentDateTo);
    }
    if (sentMethods?.length) {
      q = q.where('analysisDai.sentMethod', 'in', sentMethods);
    }
    if (edi !== null && edi !== undefined) {
      q = q.where('analysisDai.edi', '=', edi);
    }
    if (laboratoryIds?.length) {
      q = q.where('sampleItems.laboratoryId', 'in', laboratoryIds);
    }
    if (sampleIds?.length) {
      q = q.where('samples.id', 'in', sampleIds);
    }

    return q;
  };

  const totalRow = await buildFilteredQuery()
    .select((eb) => eb.fn.count('analysisDai.id').as('total'))
    .executeTakeFirst();
  const total = Number(totalRow?.total ?? 0);

  if (total === 0) {
    return { analyses: [], total: 0 };
  }

  const pageRows = await buildFilteredQuery()
    .select([
      'analysisDai.analysisId',
      'analysisDai.createdAt as latestAttemptAt'
    ])
    .orderBy((eb) => sql`${eb.ref('analysisDai.sentAt')} desc nulls last`)
    .limit(perPage)
    .offset(offset)
    .execute();

  const analysisIds = pageRows.map((r) => r.analysisId);
  const latestAttemptAtMap = new Map(
    pageRows.map((r) => [r.analysisId, r.latestAttemptAt])
  );

  const rows = await kysely
    .selectFrom('analysisDai')
    .innerJoin('analysis', 'analysis.id', 'analysisDai.analysisId')
    .innerJoin('sampleItems', (join) =>
      join
        .onRef('sampleItems.sampleId', '=', 'analysis.sampleId')
        .onRef('sampleItems.itemNumber', '=', 'analysis.itemNumber')
        .onRef('sampleItems.copyNumber', '=', 'analysis.copyNumber')
    )
    .innerJoin('samples', 'samples.id', 'analysis.sampleId')
    .leftJoin('laboratories', 'laboratories.id', 'sampleItems.laboratoryId')
    .selectAll('analysisDai')
    .select([
      'samples.id as sampleId',
      'samples.reference as sampleReference',
      'analysis.itemNumber as itemNumber',
      'analysis.copyNumber as copyNumber',
      'sampleItems.substanceKind as substanceKind',
      'laboratories.id as laboratoryId',
      'laboratories.shortName as laboratoryShortName',
      'laboratories.name as laboratoryName',
      'laboratories.address as laboratoryAddress',
      'laboratories.postalCode as laboratoryPostalCode',
      'laboratories.city as laboratoryCity',
      'laboratories.emails as laboratoryEmails'
    ])
    .select((eb) =>
      jsonArrayFrom(
        eb
          .selectFrom('analysisDaiDocuments')
          .innerJoin(
            'documents',
            'documents.id',
            'analysisDaiDocuments.documentId'
          )
          .select(['documents.id', 'documents.filename', 'documents.kind'])
          .whereRef('analysisDaiDocuments.analysisDaiId', '=', 'analysisDai.id')
      ).as('documents')
    )
    .where('analysisDai.analysisId', 'in', analysisIds)
    .orderBy('analysisDai.analysisId')
    .orderBy('analysisDai.createdAt', 'asc')
    .execute();

  //Compliqué de ne pas utiliser any ici
  const groupMap = new Map<string, any>();

  for (const row of rows) {
    if (!groupMap.has(row.analysisId)) {
      groupMap.set(row.analysisId, {
        analysisId: row.analysisId,
        sample: { id: row.sampleId, reference: row.sampleReference },
        analysis: {
          itemNumber: row.itemNumber,
          copyNumber: row.copyNumber
        },
        sampleItem: { substanceKind: row.substanceKind },
        laboratory:
          row.laboratoryId != null
            ? {
                id: row.laboratoryId,
                shortName: row.laboratoryShortName,
                name: row.laboratoryName,
                address: row.laboratoryAddress,
                postalCode: row.laboratoryPostalCode,
                city: row.laboratoryCity,
                emails: row.laboratoryEmails
              }
            : null,
        attempts: [],
        latestAttemptAt: latestAttemptAtMap.get(row.analysisId)!
      });
    }

    const group = groupMap.get(row.analysisId)!;
    group.attempts.push({
      id: row.id,
      analysisId: row.analysisId,
      state: row.state,
      createdAt: row.createdAt,
      ...(row.state !== 'PENDING'
        ? {
            sentAt: row.sentAt,
            sentMethod: row.sentMethod,
            edi: row.edi,
            ...(row.state === 'ERROR' ? { message: row.message } : {})
          }
        : {}),
      documents: row.documents
    });
  }

  return {
    analyses: analysisIds.map((id) =>
      AnalysisDaiAnalysisGroup.parse(groupMap.get(id)!)
    ),
    total
  };
};

export const analysisDaiRepository = {
  insert,
  claimPending,
  linkDocuments,
  update,
  findManyGrouped
};
