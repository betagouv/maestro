import { z } from 'zod';

export const AuthRedirectUrl = z.object({
  url: z.string().url(),
  nonce: z.string(),
  state: z.string()
});

export type AuthRedirectUrl = z.infer<typeof AuthRedirectUrl>;
