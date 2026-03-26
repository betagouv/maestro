import { z } from 'zod';
import type { MatrixKind } from '../../referential/Matrix/MatrixKind';

export const CompanyKind = z.enum([
  'POULTRY_SLAUGHTERHOUSE',
  'MEAT_SLAUGHTERHOUSE'
]);

export type CompanyKind = z.infer<typeof CompanyKind>;

export const CompanyKindByMatrixKind: Partial<Record<MatrixKind, CompanyKind>> =
  {
    A01QX: 'MEAT_SLAUGHTERHOUSE',
    A01SN: 'POULTRY_SLAUGHTERHOUSE'
  };
