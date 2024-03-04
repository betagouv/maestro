import db from './db';
import { UserApi } from '../models/UserApi';
import { UserRole } from '../../shared/types/UserRole';
import { Department } from '../../shared/types/Department';
import { WeeklyHours } from '../../shared/types/WeeklyHours';

export const usersTable = 'users';

const Users = () => db<UserDbo>(usersTable);
const get = async (userId: string): Promise<UserApi | null> => {
  console.log('Get UserApi with id', userId);
  const user = await Users().where('id', userId).first();
  return user ? parseUserApi(user) : null;
};

const insert = async (userApi: UserApi): Promise<void> => {
  console.log('Insert UserApi');
  await Users().insert(formatUserApi(userApi));
};

const update = async (userApi: UserApi): Promise<void> => {
  console.log('Update UserApi with id', userApi.id);

  const { id, ...updatedData } = formatUserApi(userApi);
  await Users().where({ id }).update(updatedData);
};

const findOne = async (email: string): Promise<UserApi | null> => {
  console.log('Find userApi with email', email);
  const user = await Users()
    .where({
      email,
    })
    .first();
  return user ? parseUserApi(user) : null;
};

const find = async (): Promise<UserApi[]> => {
  console.log('Find userApi');
  const users = await Users()
    .whereNot('role', 'Root')
    .orderBy('last_name', 'asc');
  return users.map(parseUserApi);
};

const remove = async (id: string): Promise<void> => {
  console.log('Delete userApi with id', id);
  await Users().where({ id }).delete();
};

export interface UserDbo {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  department?: Department;
  role: UserRole;
  manager: boolean;
  hourly_rate?: number;
  weekly_hours: WeeklyHours;
  created_at: Date;
  last_authenticated_at?: Date;
}

const formatUserApi = (userApi: UserApi): UserDbo => ({
  id: userApi.id,
  email: userApi.email,
  password: userApi.password,
  first_name: userApi.firstName,
  last_name: userApi.lastName,
  department: userApi.department as Department,
  role: userApi.role,
  manager: userApi.manager,
  hourly_rate: userApi.hourlyRate,
  weekly_hours: userApi.weeklyHours,
  created_at: userApi.createdAt,
  last_authenticated_at: userApi.lastAuthenticatedAt,
});

const parseUserApi = (userDbo: UserDbo) =>
  <UserApi>{
    id: userDbo.id,
    email: userDbo.email,
    password: userDbo.password,
    firstName: userDbo.first_name,
    lastName: userDbo.last_name,
    department: userDbo.department,
    role: userDbo.role,
    manager: userDbo.manager,
    hourlyRate: userDbo.hourly_rate,
    weeklyHours: userDbo.weekly_hours,
    createdAt: userDbo.created_at,
    lastAuthenticatedAt: userDbo.last_authenticated_at,
  };

export default {
  get,
  findOne,
  find,
  insert,
  update,
  remove,
  formatUserApi,
  parseUserApi,
};
