import { z } from 'zod/v4';

export const AuthRedirectUrl = z.object({
  url: z.string().url(),
  nonce: z.string().nullish(),
  state: z.string().nullish()
});

export type AuthRedirectUrl = z.infer<typeof AuthRedirectUrl>;
