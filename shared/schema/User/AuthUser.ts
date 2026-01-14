import { z } from 'zod';
import { UserRefined } from './User';
import { UserRole } from './UserRole';

export const AuthUser = z.object({
  user: UserRefined,
  userRole: UserRole
});

export type AuthUser = z.infer<typeof AuthUser>;

const authUnknownUserValidator = z.object({
  user: z.null(),
  userRole: z.null(),
  userEmail: z.string()
});
export const AuthMaybeUnknownUser = z.union([
  AuthUser,
  authUnknownUserValidator
]);
export type AuthMaybeUnknownUser = z.infer<typeof AuthMaybeUnknownUser>;
