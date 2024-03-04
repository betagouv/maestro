import { UserApi } from '../models/UserApi';
import db from './db';

export const usersTable = 'users';

const Users = () => db<UserDbo>(usersTable);
const get = async (userId: string): Promise<UserApi | null> => {
  console.log('Get UserApi with id', userId);
  const user = await Users().where('id', userId).first();
  return user ? parseUserApi(user) : null;
};

export interface UserDbo {
  id: string;
}

const formatUserApi = (userApi: UserApi): UserDbo => ({
  id: userApi.id,
});

const parseUserApi = (userDbo: UserDbo) =>
  <UserApi>{
    id: userDbo.id,
  };

export default {
  get,
  formatUserApi,
  parseUserApi,
};
