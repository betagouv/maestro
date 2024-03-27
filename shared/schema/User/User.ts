import { z } from 'zod';
import { UserRole } from './UserRole';

export const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string(),
  role: UserRole,
});

export type User = z.infer<typeof User>;
