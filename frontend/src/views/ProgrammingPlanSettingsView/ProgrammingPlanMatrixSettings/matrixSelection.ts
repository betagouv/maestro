import {
  effectiveMatrixKinds,
  type Matrix,
  type MatrixKind,
  type MatrixReferential,
  matricesOfKind,
  matrixKindLabel,
  matrixLabel
} from 'maestro-shared/schema/Matrix/MatrixReferential';
import {
  isMatrixSelected,
  type MatrixKindSelection
} from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import { includesIgnoringAccents } from 'maestro-shared/utils/utils';

export type MatrixSelection = MatrixKindSelection[];

type MatrixKindOption = {
  matrixKind: MatrixKind;
  matrices: Matrix[];
  matchedByMatrix: boolean;
};

export const removeMatrixKind = (
  selection: MatrixSelection,
  matrixKind: MatrixKind
): MatrixSelection =>
  selection.filter((item) => item.matrixKind !== matrixKind);

export const toggleMatrixKind = (
  selection: MatrixSelection,
  matrixKind: MatrixKind
): MatrixSelection => {
  const item = selection.find((item) => item.matrixKind === matrixKind);
  if (item === undefined) {
    return [...selection, { matrixKind, matrices: [] }];
  }
  return item.matrices.length === 0
    ? removeMatrixKind(selection, matrixKind)
    : selection.map((item) =>
        item.matrixKind === matrixKind ? { matrixKind, matrices: [] } : item
      );
};

export const toggleMatrix = (
  referential: MatrixReferential,
  selection: MatrixSelection,
  matrixKind: MatrixKind,
  matrix: Matrix
): MatrixSelection => {
  const item = selection.find((item) => item.matrixKind === matrixKind);
  const allMatrices = subMatrices(referential, matrixKind);
  const matrices = allMatrices.filter(
    (m) => isMatrixSelected(item, m) !== (m === matrix)
  );
  if (matrices.length === 0) {
    return removeMatrixKind(selection, matrixKind);
  }
  const next = {
    matrixKind,
    matrices: matrices.length === allMatrices.length ? [] : matrices
  };
  return item === undefined
    ? [...selection, next]
    : selection.map((item) => (item.matrixKind === matrixKind ? next : item));
};

export const subMatrices = (
  referential: MatrixReferential,
  matrixKind: MatrixKind
): Matrix[] =>
  matricesOfKind(referential, matrixKind)
    .filter((matrix: string) => matrix !== matrixKind)
    .toSorted((a, b) =>
      matrixLabel(referential, a).localeCompare(matrixLabel(referential, b))
    );

export const filterMatrixKinds = (
  referential: MatrixReferential,
  search: string
): MatrixKindOption[] => {
  const matches = (label: string) => includesIgnoringAccents(label, search);

  return effectiveMatrixKinds(referential).flatMap(
    (matrixKind): MatrixKindOption[] => {
      const matrices = subMatrices(referential, matrixKind);
      if (!search.trim() || matches(matrixKindLabel(referential, matrixKind))) {
        return [{ matrixKind, matrices, matchedByMatrix: false }];
      }
      const matchingMatrices = matrices.filter((matrix) =>
        matches(matrixLabel(referential, matrix))
      );
      return matchingMatrices.length > 0
        ? [{ matrixKind, matrices: matchingMatrices, matchedByMatrix: true }]
        : [];
    }
  );
};
