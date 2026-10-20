import type { MatrixReferential } from 'maestro-shared/schema/Matrix/MatrixReferential';

export const matrixKindLabels = (
  referential: MatrixReferential
): Record<string, string> =>
  Object.fromEntries(
    referential.matrixKinds.map(({ code, label }) => [code, label])
  );

export const matrixLabels = (
  referential: MatrixReferential
): Record<string, string> =>
  Object.fromEntries(
    referential.matrices.map(({ code, label }) => [code, label])
  );
