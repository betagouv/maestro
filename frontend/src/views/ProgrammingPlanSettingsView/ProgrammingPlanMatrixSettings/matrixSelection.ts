import type { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  type MatrixKind,
  MatrixKindEffective,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  isMatrixSelected,
  type MatrixKindSelection
} from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';

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
  selection: MatrixSelection,
  matrixKind: MatrixKind,
  matrix: Matrix
): MatrixSelection => {
  const item = selection.find((item) => item.matrixKind === matrixKind);
  const allMatrices = subMatrices(matrixKind);
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

export const subMatrices = (matrixKind: MatrixKind): Matrix[] =>
  MatrixListByKind[matrixKind].filter((matrix) => matrix !== matrixKind);

export const filterMatrixKinds = (search: string): MatrixKindOption[] => {
  const term = search.toLowerCase().trim();
  const matches = (label: string) => label.toLowerCase().includes(term);

  return MatrixKindEffective.options
    .toSorted((a, b) => MatrixKindLabels[a].localeCompare(MatrixKindLabels[b]))
    .flatMap((matrixKind): MatrixKindOption[] => {
      const matrices = subMatrices(matrixKind);
      if (!term || matches(MatrixKindLabels[matrixKind])) {
        return [{ matrixKind, matrices, matchedByMatrix: false }];
      }
      const matchingMatrices = matrices.filter((matrix) =>
        matches(MatrixLabels[matrix])
      );
      return matchingMatrices.length > 0
        ? [{ matrixKind, matrices: matchingMatrices, matchedByMatrix: true }]
        : [];
    });
};
