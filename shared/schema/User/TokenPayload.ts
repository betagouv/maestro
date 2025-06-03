import { z } from 'zod/v4';

export const TokenPayload = z.object({
  userId: z.guid().nullable(),
  idToken: z.string(),
  loggedSecret: z.guid().nullable()
});

export type TokenPayload = z.infer<typeof TokenPayload>;
