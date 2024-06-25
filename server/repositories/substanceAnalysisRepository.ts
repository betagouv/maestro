import fp from 'lodash';
import z from 'zod';
import { FindSubstanceAnalysisOptions } from '../../shared/schema/Substance/FindSubstanceAnalysisOptions';
import { SubstanceAnalysis } from '../../shared/schema/Substance/SubstanceAnalysis';
import db from './db';

const substanceTable = 'substances';
const substanceAnalysisTable = 'substance_analysis';

export const SubstanceAnalysisDbo = SubstanceAnalysis.omit({
  substance: true,
}).merge(
  z.object({
    substanceCode: z.string(),
  })
);

const SubstanceAnalysisJoinedDbo = SubstanceAnalysisDbo.merge(
  z.object({
    substanceCode: z.string(),
    substanceLabel: z.string(),
  })
);

type SubstanceAnalysisDbo = z.infer<typeof SubstanceAnalysisDbo>;
type SubstanceAnalysisJoinedDbo = z.infer<typeof SubstanceAnalysisJoinedDbo>;

export const SubstanceAnalysisTable = () =>
  db<SubstanceAnalysisDbo>(substanceAnalysisTable);

const findMany = async (
  findOptions: FindSubstanceAnalysisOptions
): Promise<SubstanceAnalysis[]> => {
  console.info('Find substance analysis', fp.omitBy(findOptions, fp.isNil));
  return SubstanceAnalysisTable()
    .select(
      `${substanceAnalysisTable}.*`,
      `${substanceTable}.code as substance_code`,
      `${substanceTable}.label as substance_label`
    )
    .where(fp.omitBy(findOptions, fp.isNil))
    .join(
      substanceTable,
      `${substanceAnalysisTable}.substanceCode`,
      `${substanceTable}.code`
    )
    .then((substanceAnalysis) =>
      substanceAnalysis.map((_: SubstanceAnalysisJoinedDbo) =>
        parseSubstanceAnalysis(_)
      )
    );
};

export const formatSubstanceAnalysis = (
  substanceAnalysis: SubstanceAnalysis
): SubstanceAnalysisDbo => ({
  ...fp.omit(substanceAnalysis, ['substance']),
  substanceCode: substanceAnalysis.substance.code,
});

export const parseSubstanceAnalysis = (
  substanceAnalysis: SubstanceAnalysisJoinedDbo
): SubstanceAnalysis =>
  substanceAnalysis &&
  SubstanceAnalysis.parse({
    ...fp.omitBy(substanceAnalysis, fp.isNil),
    substance: {
      code: substanceAnalysis.substanceCode,
      label: substanceAnalysis.substanceLabel,
    },
  });

export default {
  findMany,
};
