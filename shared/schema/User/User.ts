import { z } from 'zod';
import { Region } from '../Region';
import { UserRole } from './UserRole';

export const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().optional().nullable(),
  role: UserRole,
  region: Region.optional().nullable(),
});

export type User = z.infer<typeof User>;
