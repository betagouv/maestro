import { z } from 'zod';

export const TokenPayload = z.object({
  userId: z.string().uuid(),
});

export type TokenPayload = z.infer<typeof TokenPayload>;
