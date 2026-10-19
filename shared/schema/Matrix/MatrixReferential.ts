import { z } from 'zod';

export const Matrix = z
  .string({ error: () => 'Veuillez renseigner la matrice.' })
  .brand<'Matrix'>();
export type Matrix = z.infer<typeof Matrix>;

export const MatrixKind = z
  .string({
    error: () => 'Veuillez renseigner la catégorie de matrice programmée.'
  })
  .brand<'MatrixKind'>();
export type MatrixKind = z.infer<typeof MatrixKind>;

export const MatrixKindEntry = z.object({
  code: MatrixKind,
  label: z.string(),
  deprecated: z.boolean(),
  matrices: z.array(Matrix)
});
export type MatrixKindEntry = z.infer<typeof MatrixKindEntry>;

export const MatrixEntry = z.object({
  code: Matrix,
  label: z.string(),
  deprecated: z.boolean(),
  sachaSigle: z.string().nullable()
});
export type MatrixEntry = z.infer<typeof MatrixEntry>;

export const MatrixReferential = z.object({
  matrixKinds: z.array(MatrixKindEntry),
  matrices: z.array(MatrixEntry)
});
export type MatrixReferential = z.infer<typeof MatrixReferential>;

const byLabel = (a: { label: string }, b: { label: string }) =>
  a.label.localeCompare(b.label);

export const matrixLabel = (
  referential: MatrixReferential,
  code: Matrix
): string =>
  referential.matrices.find((matrix) => matrix.code === code)?.label ?? code;

export const matrixKindLabel = (
  referential: MatrixReferential,
  code: MatrixKind
): string =>
  referential.matrixKinds.find((matrixKind) => matrixKind.code === code)
    ?.label ?? code;

export const matricesOfKind = (
  referential: MatrixReferential,
  code: MatrixKind
): Matrix[] =>
  referential.matrixKinds.find((matrixKind) => matrixKind.code === code)
    ?.matrices ?? [];

export const effectiveMatrixKinds = (
  referential: MatrixReferential
): MatrixKind[] =>
  referential.matrixKinds
    .filter((matrixKind) => !matrixKind.deprecated)
    .sort(byLabel)
    .map((matrixKind) => matrixKind.code);

export const effectiveMatrices = (referential: MatrixReferential): Matrix[] =>
  referential.matrices
    .filter((matrix) => !matrix.deprecated)
    .sort(byLabel)
    .map((matrix) => matrix.code);
