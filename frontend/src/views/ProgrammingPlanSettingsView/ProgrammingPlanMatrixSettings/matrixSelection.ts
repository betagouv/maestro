import {
  effectiveMatrixKinds,
  type Matrix,
  type MatrixKind,
  type MatrixReferential,
  matricesOfKind,
  matrixKindLabel,
  matrixLabel
} from 'maestro-shared/schema/Matrix/MatrixReferential';
import type { MatrixKindSelection } from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import type {
  HierarchicalSelection,
  Hierarchy
} from 'src/components/_app/AppHierarchicalSelection/hierarchicalSelection';

export const subMatrices = (
  referential: MatrixReferential,
  matrixKind: MatrixKind
): Matrix[] =>
  matricesOfKind(referential, matrixKind)
    .filter((matrix: string) => matrix !== matrixKind)
    .toSorted((a, b) =>
      matrixLabel(referential, a).localeCompare(matrixLabel(referential, b))
    );

export const matrixHierarchy = (
  referential: MatrixReferential
): Hierarchy<MatrixKind, Matrix> => ({
  parents: effectiveMatrixKinds(referential),
  childrenOf: (matrixKind) => subMatrices(referential, matrixKind),
  parentLabel: (matrixKind) => matrixKindLabel(referential, matrixKind),
  childLabel: (matrix) => matrixLabel(referential, matrix)
});

export const toMatrixHierarchicalSelection = (
  items: MatrixKindSelection[]
): HierarchicalSelection<MatrixKind, Matrix> =>
  items.map(({ matrixKind, matrices }) => ({
    parent: matrixKind,
    children: matrices
  }));

export const fromMatrixHierarchicalSelection = (
  selection: HierarchicalSelection<MatrixKind, Matrix>
): MatrixKindSelection[] =>
  selection.map(({ parent, children }) => ({
    matrixKind: parent,
    matrices: children
  }));
