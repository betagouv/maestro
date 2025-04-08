import { z } from 'zod';
import { laboratoryNameValidator } from '../../referential/Laboratory';

export const Laboratory = z.object({
  id: z.string().uuid(),
  name: laboratoryNameValidator,
  emails: z.array(z.string().email())
});

export type Laboratory = z.infer<typeof Laboratory>;
