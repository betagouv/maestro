import { z } from 'zod';
import { hasPermission, type UserBase, UserRefined } from '../User/User';
import type { UserRole } from '../User/UserRole';

export const ProgrammingPlanNationalCoordinator = z
  .object(UserRefined.shape)
  .pick({ id: true, name: true });

export type ProgrammingPlanNationalCoordinator = z.infer<
  typeof ProgrammingPlanNationalCoordinator
>;

export const canUpdateProgrammingPlanSettings = (
  programmingPlan: {
    nationalCoordinators: ProgrammingPlanNationalCoordinator[];
  },
  user: Pick<UserBase, 'id'>,
  userRole: UserRole
): boolean =>
  hasPermission(userRole, 'manageProgrammingPlanNationalCoordinators') ||
  programmingPlan.nationalCoordinators.some(({ id }) => id === user.id);
