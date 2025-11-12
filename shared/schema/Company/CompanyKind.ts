import { z } from 'zod';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';

export const CompanyKind = z.enum([
  'POULTRY_SLAUGHTERHOUSE',
  'MEAT_SLAUGHTERHOUSE'
]);

export type CompanyKind = z.infer<typeof CompanyKind>;

export const CompanyKindByMatrixKind: Partial<Record<MatrixKind, CompanyKind>> =
  {
    TODO1: 'MEAT_SLAUGHTERHOUSE',
    TODO2: 'POULTRY_SLAUGHTERHOUSE'
  };
