import type { Insertable } from 'kysely';
import { ResidueDetectionStat } from 'maestro-shared/schema/Analysis/ResidueDetectionStat';
import { kysely } from './kysely';
import type { DB, KyselyMaestro } from './kysely.type';

const insert = async (
  analysisResidues: Insertable<DB['analysisResidues']>[],
  trx: KyselyMaestro = kysely
) => {
  await trx.insertInto('analysisResidues').values(analysisResidues).execute();
};

const deleteByAnalysisId = async (
  analysisId: string,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  await trx
    .deleteFrom('analysisResidues')
    .where('analysisId', '=', analysisId)
    .execute();
};

const findTopResiduesDetected = async (
  programmingPlanId?: string | null
): Promise<ResidueDetectionStat[]> => {
  let query = kysely
    .selectFrom('analysisResidues as ar')
    .innerJoin('analysis as a', 'a.id', 'ar.analysisId')
    .innerJoin('samples as s', 's.id', 'a.sampleId')
    .select(({ fn }) => [
      'ar.reference as residueReference',
      's.matrix',
      's.region',
      fn.count<number>('s.id').$castTo<number>().as('sampleCount')
    ])
    .where('ar.resultKind', '!=', 'ND' as never)
    .where('ar.reference', 'is not', null)
    .where('s.matrix', 'is not', null)
    .groupBy(['ar.reference', 's.matrix', 's.region'])
    .orderBy('sampleCount', 'desc')
    .limit(10);

  if (programmingPlanId) {
    query = query.where('s.programmingPlanId', '=', programmingPlanId);
  }

  const rows = await query.execute();

  return rows
    .filter((r) => r.residueReference !== null)
    .map((r) => ResidueDetectionStat.parse(r));
};

export const analysisResidueRepository = {
  insert,
  deleteByAnalysisId,
  findTopResiduesDetected
};
