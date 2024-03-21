import { UserApi } from '../models/UserApi';
import db from './db';

export const usersTable = 'users';

export const Users = () => db<UserDbo>(usersTable);
const get = async (userId: string): Promise<UserApi | null> => {
  console.log('Get UserApi with id', userId);
  const user = await Users().where('id', userId).first();
  return user ? parseUserApi(user) : null;
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

export interface UserDbo {
  id: string;
  email: string;
  password: string;
}

const formatUserApi = (userApi: UserApi): UserDbo => ({
  id: userApi.id,
  email: userApi.email,
  password: userApi.password,
});

const parseUserApi = (userDbo: UserDbo): UserApi => ({
  id: userDbo.id,
  email: userDbo.email,
  password: userDbo.password,
});

export default {
  get,
  findOne,
  formatUserApi,
  parseUserApi,
};
