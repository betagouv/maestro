import { z } from 'zod';
import { departementValidator } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { CompanyKind } from './CompanyKind';

export const FindCompanyOptions = z.object({
  region: Region.nullish(),
  department: departementValidator.nullish(),
  kinds: z.array(CompanyKind).nullish()
});

export type FindCompanyOptions = z.infer<typeof FindCompanyOptions>;
