import { RefinementCtx, z } from 'zod';
import { UserBase, userChecks } from './User';
import { isNationalRole, isRegionalRole, UserRole } from './UserRole';

const AuthUser = z.object({
  user: UserBase,
  userRole: UserRole
});
type AuthUser = z.infer<typeof AuthUser>;

const authUserCheck = (
  { user, userRole }: AuthUser,
  ctx: RefinementCtx<AuthUser>
) => {
  userChecks(
    {
      ...user,
      roles: [userRole]
    },
    ctx as unknown as RefinementCtx<z.infer<typeof AuthUser>['user']>
  );
  if (!user.roles.includes(userRole)) {
    ctx.addIssue({
      code: 'custom',
      path: ['userRole'],
      message: `L'utilisateur n'a pas le rôle : ${userRole}`
    });
  }
};

export const AuthUserTransformed = AuthUser.superRefine(
  authUserCheck
).transform(({ user, userRole }) => {
  return {
    user: {
      ...user,
      region: isNationalRole(userRole) ? null : user.region,
      department: isRegionalRole(userRole) ? null : user.department,
      companies: userRole === 'Sampler' ? user.companies : []
    },
    userRole
  };
});

export type AuthUserTransformed = z.infer<typeof AuthUserTransformed>;

const authUnknownUserValidator = z.object({
  user: z.null(),
  userRole: z.null(),
  userEmail: z.string()
});
export const AuthMaybeUnknownUser = z.union([
  AuthUserTransformed,
  authUnknownUserValidator
]);
export type AuthMaybeUnknownUser = z.infer<typeof AuthMaybeUnknownUser>;
