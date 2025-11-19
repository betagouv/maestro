import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { CompanyKind } from './CompanyKind';

export const FindCompanyOptions = z.object({
  region: Region.nullish(),
  department: Department.nullish(),
  kinds: coerceToArray(z.array(CompanyKind)).nullish()
});

export type FindCompanyOptions = z.infer<typeof FindCompanyOptions>;
