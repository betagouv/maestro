import { z } from 'zod';

export const AuthUser = z.object({
  userId: z.string().uuid(),
  accessToken: z.string()
});

export type AuthUser = z.infer<typeof AuthUser>;
