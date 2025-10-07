import { z } from 'zod';
import { Region } from '../../referential/Region';
import { CompanyKind } from './CompanyKind';
export const FindCompanyOptions = z.object({
  region: Region.nullish(),
  kind: CompanyKind.nullish()
});

export type FindCompanyOptions = z.infer<typeof FindCompanyOptions>;
