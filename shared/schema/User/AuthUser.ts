import { z } from 'zod';
import { UserRole } from './UserRole';

export const AuthUser = z.object({
  userId: z.string().uuid(),
  accessToken: z.string(),
  userRole: UserRole,
});

export type AuthUser = z.infer<typeof AuthUser>;
