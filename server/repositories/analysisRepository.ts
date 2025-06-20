import { isNil, omit, omitBy } from 'lodash-es';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { PartialAnalyte } from 'maestro-shared/schema/Analysis/Analyte';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { convertKeysToCamelCase } from 'maestro-shared/utils/utils';
import z from 'zod/v4';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import type { KyselyMaestro } from './kysely.type';

export const analysisTable = 'analysis';
export const analysisResiduesTable = 'analysis_residues';
const residueAnalytesTable = 'residue_analytes';

const PartialAnalysisDbo = PartialAnalysis.omit({
  residues: true
});

const PartialAnalysisJoinedDbo = PartialAnalysisDbo.merge(
  z.object({
    residues: z.array(PartialResidue).nullish()
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
                    and ${residueAnalytesTable}.result_kind != 'ND' 
                  ))::jsonb
                 ) end as residues`
      )
    )
    .leftJoin(analysisResiduesTable, function () {
      this.on(
        `${analysisResiduesTable}.analysis_id`,
        '=',
        `${analysisTable}.id`
      ).andOnVal(`${analysisResiduesTable}.result_kind`, '<>', 'ND');
    })
    .where(typeof key === 'string' ? { id: key } : { sampleId: key.sampleId })
    .groupBy(`${analysisTable}.id`)
    .first()
    .then(parsePartialAnalysis);
};
const insert = async (
  createdAnalysis: Omit<PartialAnalysis, 'id'>,
  trx: KyselyMaestro = kysely
): Promise<string> => {
  console.info('Insert analysis', createdAnalysis);
  const { analysisId } = await trx
    .insertInto('analysis')
    .values(createdAnalysis)
    .returning('analysis.id as analysisId')
    .executeTakeFirstOrThrow();

  return analysisId;
};

const update = async (partialAnalysis: PartialAnalysis): Promise<void> => {
  console.info('Update analysis', partialAnalysis.id);
  await db.transaction(async (transaction) => {
    if (Object.keys(partialAnalysis).length > 0) {
      await Analysis(transaction)
        .where({ id: partialAnalysis.id })
        .update(formatPartialAnalysis(partialAnalysis));

      await AnalysisResidues(transaction)
        .delete()
        .where({
          analysisId: partialAnalysis.id
        })
        .where((b) => {
          const referencesToUpdate =
            partialAnalysis.residues?.map(({ reference }) => reference) ?? [];

          let q = b.where('resultKind', '<>', 'ND');
          if (referencesToUpdate.length > 0) {
            q = q.orWhereIn('reference', referencesToUpdate);
          }
          return q;
        });

      if (partialAnalysis.residues && partialAnalysis.residues.length > 0) {
        const maxResidueNumberResult = await AnalysisResidues(transaction)
          .select<{ max: number }[]>(transaction.raw(`MAX(residue_number)`))
          .where('analysisId', partialAnalysis.id);

        const max = maxResidueNumberResult[0]?.max;

        partialAnalysis.residues.forEach((r, index) => {
          const newResidueNumber = max + index + 1;
          r.residueNumber = newResidueNumber;
          r.analytes?.forEach((a) => {
            a.residueNumber = newResidueNumber;
          });
        });

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

const formatPartialAnalysis = (
  partialAnalysis: PartialAnalysis
): PartialAnalysisDbo => ({
  ...omit(partialAnalysis, ['residues'])
});

const formatPartialResidue = (
  partialResidue: PartialResidue
): PartialResidue => ({
  ...omit(partialResidue, ['analytes'])
});

const parsePartialAnalysis = (
  partialAnalysisJoinedDbo: PartialAnalysisJoinedDbo
): PartialAnalysis =>
  partialAnalysisJoinedDbo &&
  PartialAnalysis.parse({
    ...omit(omitBy(partialAnalysisJoinedDbo, isNil), ['residues', 'analytes']),
    residues: partialAnalysisJoinedDbo.residues?.map((residue) =>
      convertKeysToCamelCase(
        omitBy(
          {
            ...residue,
            analytes: residue.analytes?.map((analyte) =>
              convertKeysToCamelCase(omitBy(analyte, isNil))
            )
          },
          isNil
        )
      )
    )
  });

export const analysisRepository = {
  findUnique,
  insert,
  update
};
