import { z } from 'zod';
import { laboratoryShortNameValidator } from '../../referential/Laboratory';

export const Laboratory = z.object({
  id: z.guid(),
  shortName: laboratoryShortNameValidator,
  name: z.string(),
  address: z.string(),
  postalCode: z.string(),
  city: z.string(),
  emails: z.array(z.email())
});

export type Laboratory = z.infer<typeof Laboratory>;

export const getLaboratoryFullName = (laboratory: Laboratory): string =>
  `${laboratory.shortName} - ${laboratory.name}`;
