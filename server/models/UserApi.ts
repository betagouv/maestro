import { UserRole } from '../../shared/types/UserRole';
import { Department } from '../../shared/types/Department';
import { WeeklyHours } from '../../shared/types/WeeklyHours';

export interface UserInfosApi {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: Department;
  role: UserRole;
  manager: boolean;
  hourlyRate?: number;
  weeklyHours: WeeklyHours;
}

export type UserApi = UserInfosApi & {
  password: string;
  firstName: string;
  createdAt: Date;
  lastAuthenticatedAt?: Date;
};

export interface TokenPayload {
  userId: string;
}

export const isAdmin = (user: UserApi) =>
  user.role === 'Admin' || user.role === 'Root';
