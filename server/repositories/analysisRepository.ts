import fp from 'lodash';
import z from 'zod';
import {
  CreatedAnalysis,
  PartialAnalysis,
} from '../../shared/schema/Analysis/Analysis';
import { PartialResidue } from '../../shared/schema/Analysis/Residue/Residue';
import { convertKeysToCamelCase } from '../../shared/utils/utils';
import db from './db';

const analysisTable = 'analysis';
const analysisResiduesTable = 'analysis_residues';

const PartialAnalysisDbo = PartialAnalysis.omit({
  residues: true,
});

const PartialAnalysisJoinedDbo = PartialAnalysisDbo.merge(
  z.object({
    residues: z.array(PartialResidue).optional().nullable(),
  })
);

type PartialAnalysisDbo = z.infer<typeof PartialAnalysisDbo>;
type PartialAnalysisJoinedDbo = z.infer<typeof PartialAnalysisJoinedDbo>;

export const Analysis = (transaction = db) =>
  transaction<PartialAnalysisDbo>(analysisTable);
export const AnalysisResidues = (transaction = db) =>
  transaction<PartialResidue>(analysisResiduesTable);

const findUnique = async (
  key: string | { sampleId: string }
): Promise<PartialAnalysis | undefined> => {
  console.info('Find analysis with key', key);
  return Analysis()
    .select(
      `${analysisTable}.*`,
      db.raw(
        `case when count(analysis_residues.*) = 0 then null 
                 else array_agg(to_json(analysis_residues.*)) end as residues`
      )
    )
    .leftJoin(
      analysisResiduesTable,
      `${analysisResiduesTable}.analysis_id`,
      `${analysisTable}.id`
    )
    .where(typeof key === 'string' ? { id: key } : { sampleId: key.sampleId })
    .groupBy(`${analysisTable}.id`)
    .first()
    .then(parsePartialAnalysis);
};
const insert = async (createdAnalysis: CreatedAnalysis): Promise<void> => {
  console.info('Insert analysis', createdAnalysis);
  await Analysis().insert(formatPartialAnalysis(createdAnalysis));
};

const update = async (partialAnalysis: PartialAnalysis): Promise<void> => {
  console.info('Update analysis', partialAnalysis.id);
  await db.transaction(async (transaction) => {
    if (Object.keys(partialAnalysis).length > 0) {
      await Analysis(transaction)
        .where({ id: partialAnalysis.id })
        .update(formatPartialAnalysis(partialAnalysis));

      await AnalysisResidues(transaction).delete().where({
        analysisId: partialAnalysis.id,
      });

      if (partialAnalysis.residues && partialAnalysis.residues.length > 0) {
        await AnalysisResidues(transaction).insert(partialAnalysis.residues);
      }
    }
  });
};

export const formatPartialAnalysis = (
  partialAnalysis: PartialAnalysis
): PartialAnalysisDbo => ({
  ...fp.omit(partialAnalysis, ['residues']),
});

export const parsePartialAnalysis = (
  partialAnalysisJoinedDbo: PartialAnalysisJoinedDbo
): PartialAnalysis =>
  partialAnalysisJoinedDbo &&
  PartialAnalysis.parse({
    ...fp.omitBy(partialAnalysisJoinedDbo, fp.isNil),
    residues: partialAnalysisJoinedDbo.residues?.map((residue) =>
      convertKeysToCamelCase(fp.omitBy(residue, fp.isNil))
    ),
  });

export default {
  findUnique,
  insert,
  update,
};
