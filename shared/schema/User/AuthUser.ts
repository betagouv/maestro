import { z } from 'zod';


export const AuthUser = z.object({
  userId: z.string().uuid(),
  accessToken: z.string(),
});

export type AuthUser = z.infer<typeof AuthUser>;


const authUnknownUserValidator = z.object({
  userId: z.null(),
  accessToken: z.string()
})
export const authMaybeUnknownUserValidator = z.union([AuthUser, authUnknownUserValidator])
export type AuthMaybeUnknownUser = z.infer<typeof authMaybeUnknownUserValidator>