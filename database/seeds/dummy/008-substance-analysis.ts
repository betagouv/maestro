import { SubstanceAnalysisTable } from '../../../server/repositories/substanceAnalysisRepository';
import { Matrix } from '../../../shared/referential/Matrix/Matrix';
import { SubstanceAnalysisKind } from '../../../shared/schema/Substance/SubstanceAnalysisKind';

exports.seed = async function () {
  const genMonoSubstanceAnalysis = (matrix: Matrix, substanceCode: string) => ({
    matrix,
    substanceCode,
    kind: 'Mono' as SubstanceAnalysisKind,
    year: 2024,
  });

  const substanceAnalysis = [
    genMonoSubstanceAnalysis('A00KT', 'RF-0791-001-PPP'),
  ];

  await SubstanceAnalysisTable().insert(substanceAnalysis);
};
