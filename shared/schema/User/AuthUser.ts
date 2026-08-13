import { type RefinementCtx, z } from 'zod';
import { superRefineSchema } from '../../utils/zod';
import { UserBase, userChecks } from './User';
import { isNationalRole, isRegionalRole, UserRole } from './UserRole';

// Identité brute du compte connecté : les valeurs telles qu'elles sont en base, non
// écrasées par le rôle actif.
export const UserAccount = UserBase.pick({
  id: true,
  roles: true,
  region: true,
  department: true,
  stages: true,
  programmingSubPlans: true
});
export type UserAccount = z.infer<typeof UserAccount>;

const AuthUser = z.object({
  user: UserBase,
  userRole: UserRole,
  account: UserAccount.optional()
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

export const AuthUserRefined = superRefineSchema(
  AuthUser.transform(({ user, userRole, account }) => {
    return {
      user: {
        ...user,
        region: isNationalRole(userRole) ? null : user.region,
        department: isRegionalRole(userRole) ? null : user.department,
        companies: userRole === 'Sampler' ? user.companies : [],
        laboratoryId: userRole === 'LaboratoryUser' ? user.laboratoryId : null
      },
      userRole,
      account: account ?? UserAccount.parse(user)
    };
  }),
  authUserCheck
);

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
