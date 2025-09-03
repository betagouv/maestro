import { z } from 'zod';

export const TokenPayload = z.object({
  userId: z.guid().nullable(),
  idToken: z.string(),
  loggedSecret: z.guid().nullable()
});

export type TokenPayload = z.infer<typeof TokenPayload>;
