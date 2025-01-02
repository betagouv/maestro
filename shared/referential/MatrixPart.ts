import { z } from 'zod';

export const MatrixPart = z.enum(['PART1', 'PART2'], {
  errorMap: () => ({
    message: 'Veuillez renseigner la partie du végétal.'
  })
});

export type MatrixPart = z.infer<typeof MatrixPart>;

export const MatrixPartList: MatrixPart[] = MatrixPart.options;

export const MatrixPartLabels: Record<MatrixPart, string> = {
  PART1: "Partie à laquelle s'applique la LMR",
  PART2: 'Partie non LMR (préciser en commentaire)'
};
