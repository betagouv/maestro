import { isNil } from 'lodash';
import { FindUserOptions } from '../../shared/schema/User/FindUserOptions';
import { User, UserInfos } from '../../shared/schema/User/User';
import db from './db';
import { kysely } from './kysely';
import { assertUnreachable } from '../../shared/utils/typescript';
import { sql } from 'kysely';
import { UserRole } from '../../shared/schema/User/UserRole';

export const usersTable = 'users';

export const Users = () => db<User>(usersTable);
const findUnique = async (userId: string): Promise<User | undefined> => {
  console.log('Get User with id', userId);
  const user: User | undefined = await kysely.selectFrom('users').selectAll().where('id', '=', userId).executeTakeFirst()

  return User.optional().parse(user)
};

const findOne = async (email: string): Promise<User | undefined> => {
  console.log('Find user with email', email);
  const user: User | undefined = await kysely.selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst()

  return User.optional().parse(user);
};

const findMany = async (findOptions: FindUserOptions): Promise<UserInfos[]> => {
  console.log('Find users', findOptions);
  let query =   kysely.selectFrom('users').selectAll()

  for (const option of FindUserOptions.keyof().options){
    switch (option){
      case 'region':
        if( !isNil(findOptions.region)) {
          query = query.where('region', '=', findOptions.region)
        }
        break
      case 'role':
        if( !isNil(findOptions.role)) {
          query = query.where('roles', '@>', sql<UserRole[]>`ARRAY[${findOptions.role}]`)
        }
        break
      default:
        assertUnreachable(option)
    }}

  const users: User[] = await query.execute()

  return users.map((_: UserInfos) => UserInfos.parse(_))
};

export default {
  findUnique,
  findOne,
  findMany,
};
