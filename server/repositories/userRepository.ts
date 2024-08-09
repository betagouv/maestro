import fp from 'lodash';
import { FindUserOptions } from '../../shared/schema/User/FindUserOptions';
import { User, UserInfos } from '../../shared/schema/User/User';
import db from './db';

export const usersTable = 'users';

export const Users = () => db<User>(usersTable);
const findUnique = async (userId: string): Promise<User | undefined> => {
  console.log('Get User with id', userId);
  return Users()
    .where('id', userId)
    .first()
    .then((_) => _ && User.parse(fp.omitBy(_, fp.isNil)));
};

const findOne = async (email: string): Promise<User | undefined> => {
  console.log('Find user with email', email);
  return Users()
    .where({
      email,
    })
    .first()
    .then((_) => _ && User.parse(fp.omitBy(_, fp.isNil)));
};

const findMany = async (findOptions: FindUserOptions): Promise<UserInfos[]> => {
  console.log('Find users', findOptions);
  return Users()
    .where(fp.omit(fp.omitBy(findOptions, fp.isNil), ['role']))
    .modify((builder) => {
      if (findOptions.role) {
        builder.where('roles', '@>', [findOptions.role]);
      }
    })
    .then((users) =>
      users.map((_: UserInfos) => UserInfos.parse(fp.omitBy(_, fp.isNil)))
    );
};

export default {
  findUnique,
  findOne,
  findMany,
};
