import { z } from 'zod';
import { PartialSample } from '../../schema/Sample/Sample';

export const MatrixPart = z.enum(['PART1', 'PART2'], {
  error: () => 'Veuillez renseigner la partie du végétal.'
});

export type MatrixPart = z.infer<typeof MatrixPart>;

export const MatrixPartList: MatrixPart[] = MatrixPart.options;

export const MatrixPartLabels: Record<MatrixPart, string> = {
  PART1: "Partie à laquelle s'applique la LMR",
  PART2: 'Partie non LMR (préciser en commentaire)'
};

export const getMatrixPartLabel = (partialSample: PartialSample) =>
  partialSample.specificData?.programmingPlanKind === 'PPV' &&
  partialSample.specificData.matrixPart
    ? MatrixPartLabels[partialSample.specificData.matrixPart]
    : undefined;
