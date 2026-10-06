import { isNil } from 'lodash-es';
import { z } from 'zod';
import type { CheckFn } from 'zod/v4/core';
import { Matrix, MatrixList } from '../../referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels,
  OtherMatrixKind
} from '../../referential/Matrix/MatrixKind';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { checkSchema } from '../../utils/zod';
import {
  isMatrixSelected,
  type SubPlanMatrices
} from '../ProgrammingPlan/SubPlanMatrices';

const sampleMatrixCheck: CheckFn<{
  matrixKind: MatrixKind | 'Other';
  matrix: Matrix | string;
}> = (ctx) => {
  if (
    ctx.value.matrixKind !== 'Other' &&
    !Matrix.safeParse(ctx.value.matrix).success
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'invalid_value',
      values: MatrixList,
      path: ['matrix']
    });
  }
};

export const SampleMatrix = checkSchema(
  z.object({
    matrixKind: z.union([MatrixKind, OtherMatrixKind], {
      error: (issue) =>
        isNil(issue.input)
          ? 'Veuillez renseigner la catégorie de matrice programmée.'
          : issue.message
    }),
    matrix: z.union([Matrix, z.string().nonempty()], {
      error: (issue) =>
        isNil(issue.input) ? 'Veuillez renseigner la matrice.' : issue.message
    })
  }),
  sampleMatrixCheck
);
export type SampleMatrix = z.infer<typeof SampleMatrix>;

export const PartialSampleMatrix = z.object({
  matrixKind: z.union([MatrixKind, OtherMatrixKind]).nullish(),
  matrix: z.union([Matrix, z.string().nonempty()]).nullish()
});
export type PartialSampleMatrix = z.infer<typeof PartialSampleMatrix>;

export const getSampleMatrixLabel = ({
  matrixKind,
  matrix
}: PartialSampleMatrix): string =>
  isNil(matrix)
    ? ''
    : matrixKind === OtherMatrixKind.value
      ? matrix
      : MatrixLabels[matrix as Matrix];

export const getSampleMatrixLabels = (
  matrices: PartialSampleMatrix[] | null | undefined
): string[] =>
  (matrices ?? []).map(getSampleMatrixLabel).filter((label) => label !== '');

export const sampleMatricesIssues = (
  matrices: PartialSampleMatrix[],
  subPlanMatrices: SubPlanMatrices | null
): { path: (string | number)[]; message: string }[] => {
  if (!subPlanMatrices) {
    return [];
  }

  const entryIssues = matrices.flatMap(({ matrixKind, matrix }, index) => {
    const item = subPlanMatrices.items.find(
      (item) => item.matrixKind === matrixKind
    );
    if (!item) {
      return [
        {
          path: ['matrices', index, 'matrixKind'],
          message: 'Cette catégorie de matrice n’est pas programmée.'
        }
      ];
    }
    return !isNil(matrix) && !isMatrixSelected(item, matrix as Matrix)
      ? [
          {
            path: ['matrices', index, 'matrix'],
            message: 'Cette matrice n’est pas programmée.'
          }
        ]
      : [];
  });

  if (subPlanMatrices.operator === 'Or') {
    return [
      ...entryIssues,
      ...(matrices.length === 1
        ? []
        : [
            {
              path: ['matrices'],
              message:
                matrices.length === 0
                  ? 'Veuillez renseigner la matrice.'
                  : 'Une seule matrice est attendue.'
            }
          ])
    ];
  }

  return [
    ...entryIssues,
    ...matrices.flatMap(({ matrix }, index) =>
      !isNil(matrix) &&
      matrices.findIndex((entry) => entry.matrix === matrix) < index
        ? [
            {
              path: ['matrices', index, 'matrix'],
              message: 'Cette matrice est déjà renseignée.'
            }
          ]
        : []
    ),
    ...subPlanMatrices.items.flatMap(({ matrixKind }) => {
      const count = matrices.filter(
        (entry) => entry.matrixKind === matrixKind
      ).length;
      return count === 1
        ? []
        : [
            {
              path: ['matrices'],
              message:
                count === 0
                  ? `Veuillez renseigner une matrice de la catégorie « ${MatrixKindLabels[matrixKind]} ».`
                  : `Une seule matrice de la catégorie « ${MatrixKindLabels[matrixKind]} » est attendue.`
            }
          ];
    })
  ];
};
