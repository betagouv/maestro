import { z } from 'zod';
import { hasAccountPermission, type UserBase, UserRefined } from '../User/User';
import type { UserRole } from '../User/UserRole';

export const ProgrammingPlanNationalCoordinator = z
  .object(UserRefined.shape)
  .pick({ id: true, name: true, email: true });

export type ProgrammingPlanNationalCoordinator = z.infer<
  typeof ProgrammingPlanNationalCoordinator
>;

export const canUpdateProgrammingPlanSettings = (
  programmingPlan: {
    nationalCoordinators: ProgrammingPlanNationalCoordinator[];
  },
  user: Pick<UserBase, 'id'>,
  userRoles: UserRole[]
): boolean =>
  hasAccountPermission(
    userRoles,
    'manageProgrammingPlanNationalCoordinators'
  ) || programmingPlan.nationalCoordinators.some(({ id }) => id === user.id);
