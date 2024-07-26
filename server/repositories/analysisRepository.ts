import fp from 'lodash';
import z from 'zod';
import {
  CreatedAnalysis,
  PartialAnalysis,
} from '../../shared/schema/Analysis/Analysis';
import { PartialAnalyte } from '../../shared/schema/Analysis/Analyte';
import { PartialResidue } from '../../shared/schema/Analysis/Residue/Residue';
import { convertKeysToCamelCase } from '../../shared/utils/utils';
import db from './db';

const analysisTable = 'analysis';
const analysisResiduesTable = 'analysis_residues';
const residueAnalytesTable = 'residue_analytes';

const PartialAnalysisDbo = PartialAnalysis.omit({
  residues: true,
});

const PartialAnalysisJoinedDbo = PartialAnalysisDbo.merge(
  z.object({
    residues: z.array(PartialResidue).nullish(),
  })
);

type PartialAnalysisDbo = z.infer<typeof PartialAnalysisDbo>;
type PartialAnalysisJoinedDbo = z.infer<typeof PartialAnalysisJoinedDbo>;

export const Analysis = (transaction = db) =>
  transaction<PartialAnalysisDbo>(analysisTable);
export const AnalysisResidues = (transaction = db) =>
  transaction<PartialResidue>(analysisResiduesTable);
export const ResidueAnalytes = (transaction = db) =>
  transaction<PartialAnalyte>(residueAnalytesTable);

const findUnique = async (
  key: string | { sampleId: string }
): Promise<PartialAnalysis | undefined> => {
  console.info('Find analysis with key', key);
  return Analysis()
    .select(
      `${analysisTable}.*`,
      db.raw(
        `case when count(analysis_residues.*) = 0 then null 
                 else array_agg(
                  to_json(analysis_residues.*)::jsonb || 
                  json_build_object('analytes', (
                    select json_agg(to_json(${residueAnalytesTable}.*))
                    from ${residueAnalytesTable}
                    where ${residueAnalytesTable}.analysis_id = analysis_residues.analysis_id
                    and ${residueAnalytesTable}.residue_number = analysis_residues.residue_number
                  ))::jsonb
                 ) end as residues`
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
        await AnalysisResidues(transaction).insert(
          partialAnalysis.residues.map(formatPartialResidue)
        );

        const analytes = partialAnalysis.residues.flatMap(
          (residue) => residue.analytes ?? []
        );

        if (analytes.length > 0) {
          await ResidueAnalytes(transaction).insert(analytes);
        }
      }
    }
  });
};

export const formatPartialAnalysis = (
  partialAnalysis: PartialAnalysis
): PartialAnalysisDbo => ({
  ...fp.omit(partialAnalysis, ['residues']),
});

export const formatPartialResidue = (
  partialResidue: PartialResidue
): PartialResidue => ({
  ...fp.omit(partialResidue, ['analytes']),
});

export const parsePartialAnalysis = (
  partialAnalysisJoinedDbo: PartialAnalysisJoinedDbo
): PartialAnalysis =>
  partialAnalysisJoinedDbo &&
  PartialAnalysis.parse({
    ...fp.omit(fp.omitBy(partialAnalysisJoinedDbo, fp.isNil), [
      'residues',
      'analytes',
    ]),
    residues: partialAnalysisJoinedDbo.residues?.map((residue) =>
      convertKeysToCamelCase(
        fp.omitBy(
          {
            ...residue,
            analytes: residue.analytes?.map((analyte) =>
              convertKeysToCamelCase(fp.omitBy(analyte, fp.isNil))
            ),
          },
          fp.isNil
        )
      )
    ),
  });

export default {
  findUnique,
  insert,
  update,
};
