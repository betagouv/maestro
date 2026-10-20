import { isNil } from 'lodash-es';
import { z } from 'zod';
import {
  Matrix,
  MatrixKind,
  type MatrixReferential,
  matrixKindLabel,
  matrixLabel,
  OtherMatrixKind
} from '../Matrix/MatrixReferential';
import {
  isMatrixSelected,
  type SubPlanMatrices
} from '../ProgrammingPlan/SubPlanMatrices';

export const SampleMatrix = z.object({
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
});
export type SampleMatrix = z.infer<typeof SampleMatrix>;

export const PartialSampleMatrix = z.object({
  matrixKind: z.union([MatrixKind, OtherMatrixKind]).nullish(),
  matrix: z.union([Matrix, z.string().nonempty()]).nullish()
});
export type PartialSampleMatrix = z.infer<typeof PartialSampleMatrix>;

export const getSampleMatrixLabel = (
  referential: MatrixReferential,
  { matrixKind, matrix }: PartialSampleMatrix
): string =>
  isNil(matrix)
    ? ''
    : matrixKind === OtherMatrixKind.value
      ? matrix
      : matrixLabel(referential, matrix as Matrix);

export const getSampleMatrixLabels = (
  referential: MatrixReferential,
  matrices: PartialSampleMatrix[] | null | undefined
): string[] =>
  (matrices ?? [])
    .map((matrix) => getSampleMatrixLabel(referential, matrix))
    .filter((label) => label !== '');

export const sampleMatricesIssues = (
  referential: MatrixReferential,
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
                  ? `Veuillez renseigner une matrice de la catégorie « ${matrixKindLabel(referential, matrixKind)} ».`
                  : `Une seule matrice de la catégorie « ${matrixKindLabel(referential, matrixKind)} » est attendue.`
            }
          ];
    })
  ];
};
