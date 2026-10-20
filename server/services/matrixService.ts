import { isNil } from 'lodash-es';
import {
  type MatrixReferential,
  OtherMatrixKind
} from 'maestro-shared/schema/Matrix/MatrixReferential';
import type { SubPlanMatrices } from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import type { PartialSampleMatrix } from 'maestro-shared/schema/Sample/SampleMatrix';

const hasUnknownCodes = (
  referential: MatrixReferential,
  matrixKinds: string[],
  matrices: string[]
): boolean => {
  const knownMatrixKinds = new Set<string>(
    referential.matrixKinds.map(({ code }) => code)
  );
  const knownMatrices = new Set<string>(
    referential.matrices.map(({ code }) => code)
  );

  return (
    matrixKinds.some((code) => !knownMatrixKinds.has(code)) ||
    matrices.some((code) => !knownMatrices.has(code))
  );
};

export const hasUnknownSampleMatrixCodes = (
  referential: MatrixReferential,
  sampleMatrices: PartialSampleMatrix[]
): boolean => {
  const programmed = sampleMatrices.filter(
    ({ matrixKind }) => matrixKind !== OtherMatrixKind.value
  );

  return hasUnknownCodes(
    referential,
    programmed.flatMap(({ matrixKind }) =>
      isNil(matrixKind) ? [] : [matrixKind]
    ),
    programmed.flatMap(({ matrix }) => (isNil(matrix) ? [] : [matrix]))
  );
};

export const hasUnknownSubPlanMatrixCodes = (
  referential: MatrixReferential,
  subPlanMatrices: SubPlanMatrices | null
): boolean =>
  hasUnknownCodes(
    referential,
    (subPlanMatrices?.items ?? []).map(({ matrixKind }) => matrixKind),
    (subPlanMatrices?.items ?? []).flatMap(({ matrices }) => matrices)
  );
