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

export const AuthUserRefined = AuthUser.transform(({ user, userRole }) => {
  return {
    user: {
      ...user,
      region: isNationalRole(userRole) ? null : user.region,
      department: isRegionalRole(userRole) ? null : user.department,
      companies: userRole === 'Sampler' ? user.companies : [],
      laboratoryId: userRole === 'LaboratoryUser' ? user.laboratoryId : null
    },
    userRole
  };
}).superRefine(authUserCheck);

export type AuthUserRefined = z.infer<typeof AuthUserRefined>;

const authUnknownUserValidator = z.object({
  user: z.null(),
  userRole: z.null(),
  userEmail: z.string()
});
export const AuthMaybeUnknownUser = z.union([
  AuthUserRefined,
  authUnknownUserValidator
]);
export type AuthMaybeUnknownUser = z.infer<typeof AuthMaybeUnknownUser>;
