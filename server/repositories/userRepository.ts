import { isNil } from 'lodash-es';
import { FindUserOptions } from 'maestro-shared/schema/User/FindUserOptions';
import { User } from 'maestro-shared/schema/User/User';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

export const usersTable = 'users';

export const Users = () => db<User>(usersTable);
const findUnique = async (userId: string): Promise<User | undefined> => {
  console.log('Get User with id', userId);
  const user: User | undefined = await kysely
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirst();

  return User.optional().parse(user);
};

const findOne = async (email: string): Promise<User | undefined> => {
  console.log('Find user with email', email);
  const user: User | undefined = await kysely
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

  return User.optional().parse(user);
};

const findMany = async (findOptions: FindUserOptions): Promise<User[]> => {
  console.log('Find users', findOptions);
  let query = kysely.selectFrom('users').selectAll();

  for (const option of FindUserOptions.keyof().options) {
    switch (option) {
      case 'region':
        if (!isNil(findOptions.region)) {
          query = query.where('region', '=', findOptions.region);
        }
        break;
      case 'role':
        if (!isNil(findOptions.role)) {
          query = query.where('role', '=', findOptions.role);
        }
        break;
      default:
        assertUnreachable(option);
    }
  }

  const users: User[] = await query.execute();

  return users.map((_: User) => User.parse(_));
};

const updateNames = async (
  partialUser: Pick<User, 'email' | 'lastName' | 'firstName'>
): Promise<void> => {
  await kysely
    .updateTable('users')
    .set({
      firstName: partialUser.firstName,
      lastName: partialUser.lastName
    })
    .where('email', '=', partialUser.email)
    .execute();
};

export const userRepository = {
  findUnique,
  findOne,
  findMany,
  updateNames
};
