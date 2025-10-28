import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { CompanyKind } from './CompanyKind';
export const FindCompanyOptions = z.object({
  region: Region.nullish(),
  department: Department.nullish(),
  kind: CompanyKind.nullish()
});

export type FindCompanyOptions = z.infer<typeof FindCompanyOptions>;
