import { z } from 'zod';

export const TokenPayload = z.object({
  userId: z.string().uuid().nullable(),
  idToken: z.string(),
  loggedSecret: z.string().uuid().nullable()
});

export type TokenPayload = z.infer<typeof TokenPayload>;
