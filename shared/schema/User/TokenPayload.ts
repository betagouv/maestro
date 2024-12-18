import { z } from 'zod';

export const TokenPayload = z.object({
  userId: z.string().uuid(),
  idToken: z.string()
});

export type TokenPayload = z.infer<typeof TokenPayload>;
