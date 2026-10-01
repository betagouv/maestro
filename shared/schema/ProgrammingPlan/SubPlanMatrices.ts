import { uniqBy } from 'lodash-es';
import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels
} from '../../referential/Matrix/MatrixKind';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { refineSchema } from '../../utils/zod';

export const MatrixOperator = z.enum(['Or', 'And']);
export type MatrixOperator = z.infer<typeof MatrixOperator>;

export const MatrixKindSelection = z.object({
  matrixKind: MatrixKind,
  matrices: z.array(Matrix)
});
export type MatrixKindSelection = z.infer<typeof MatrixKindSelection>;

export const SubPlanMatrices = z.object({
  operator: MatrixOperator,
  items: refineSchema(
    z.array(MatrixKindSelection).min(1),
    (items) => uniqBy(items, 'matrixKind').length === items.length,
    'Une catégorie de matrice ne peut apparaître qu’une fois.'
  )
});
export type SubPlanMatrices = z.infer<typeof SubPlanMatrices>;

export const isMatrixSelected = (
  item: MatrixKindSelection | undefined,
  matrix: Matrix
) =>
  item !== undefined &&
  (item.matrices.length === 0 || item.matrices.includes(matrix));

export const getSubPlanMatrixKinds = (
  matrices: SubPlanMatrices | null
): MatrixKind[] => (matrices?.items ?? []).map(({ matrixKind }) => matrixKind);

export const getSubPlanMatrixLabels = (
  matrices: SubPlanMatrices | null
): string[] =>
  (matrices?.items ?? []).flatMap((item) =>
    item.matrices.length === 0
      ? [MatrixKindLabels[item.matrixKind]]
      : item.matrices.map((matrix) => MatrixLabels[matrix])
  );

export const subPlanMatrixNameParts = (
  matrices: SubPlanMatrices | null
): string[] => {
  const items = matrices?.items ?? [];
  const detailedMatrices = items.flatMap((item) => item.matrices);

  return items.map((item) =>
    detailedMatrices.length === 1 && item.matrices.length === 1
      ? MatrixLabels[item.matrices[0]]
      : MatrixKindLabels[item.matrixKind]
  );
};
