import { z } from 'zod';


export const AuthUser = z.object({
  userId: z.string().uuid(),
  accessToken: z.string(),
});

export type AuthUser = z.infer<typeof AuthUser>;


const authUnknownUserValidator = z.object({
  userId: z.null(),
  userEmail: z.string(),
  accessToken: z.string()
})
export const AuthMaybeUnknownUser = z.union([AuthUser, authUnknownUserValidator])
export type AuthMaybeUnknownUser = z.infer<typeof AuthMaybeUnknownUser>