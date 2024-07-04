import fp from 'lodash';
import z from 'zod';
import {
  CreatedAnalysis,
  PartialAnalysis,
} from '../../shared/schema/Analysis/Analysis';
import db from './db';

const analysisTable = 'analysis';

const PartialAnalysisDbo = PartialAnalysis.omit({
  residues: true,
});

type PartialAnalysisDbo = z.infer<typeof PartialAnalysisDbo>;

export const Analysis = () => db<PartialAnalysisDbo>(analysisTable);

const insert = async (createdAnalysis: CreatedAnalysis): Promise<void> => {
  console.info('Insert analysis', createdAnalysis);
  await Analysis().insert(formatPartialAnalysis(createdAnalysis));
};

export const formatPartialAnalysis = (
  partialAnalysis: PartialAnalysis
): PartialAnalysisDbo => ({
  ...fp.omit(partialAnalysis, ['residues']),
});

export default {
  insert,
};
