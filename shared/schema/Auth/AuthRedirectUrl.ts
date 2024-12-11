import { z } from 'zod';

export const AuthRedirectUrl = z.object({
  url: z.string().url(),
  nonce: z.string().optional(),
  state: z.string().optional()
});

export type AuthRedirectUrl = z.infer<typeof AuthRedirectUrl>;
