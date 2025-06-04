import { z } from 'zod/v4';
import { laboratoryNameValidator } from '../../referential/Laboratory';

export const Laboratory = z.object({
  id: z.guid(),
  name: laboratoryNameValidator,
  emails: z.array(z.string().email())
});

export type Laboratory = z.infer<typeof Laboratory>;
