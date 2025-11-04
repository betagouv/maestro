import { sql } from 'kysely';
import { isNil } from 'lodash-es';
import { FindUserOptions } from 'maestro-shared/schema/User/FindUserOptions';
import { User } from 'maestro-shared/schema/User/User';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import { Users as KyselyUser } from './kysely.type';

export const usersTable = 'users';

export const Users = () => db<User>(usersTable);
const findUnique = async (
  userId: string
): Promise<(User & { loggedSecrets: string[] }) | undefined> => {
  console.log('Get User with id', userId);

  return kysely
    .selectFrom('users')
    .leftJoin('companies', 'users.companySiret', 'companies.siret')
    .where('id', '=', userId)
    .select([
      'users.id',
      'users.email',
      'users.name',
      'users.role',
      'users.region',
      'users.department',
      'users.loggedSecrets',
      'users.programmingPlanKinds',
      'companies.siret as companySiret',
      'companies.name as companyName',
      'companies.kind as companyKind',
      'companies.geolocation as companyGeolocation'
    ])
    .executeTakeFirst()
    .then((user) =>
      user
        ? {
            ...User.parse(user),
            loggedSecrets: user.loggedSecrets ?? [],
            company:
              user.companySiret && user.companyName
                ? {
                    siret: user.companySiret,
                    name: user.companyName,
                    kind: user.companyKind,
                    geolocation: user.companyGeolocation
                  }
                : null
          }
        : undefined
    );
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
  let query = kysely.selectFrom('users').selectAll().orderBy('name');

  for (const option of FindUserOptions.keyof().options) {
    switch (option) {
      case 'region':
        if (!isNil(findOptions.region)) {
          query = query.where('region', '=', findOptions.region);
        }
        break;
      case 'department':
        if (!isNil(findOptions.department)) {
          query = query.where('department', '=', findOptions.department);
        }
        break;
      case 'roles':
        if (!isNil(findOptions.roles) && findOptions.roles.length > 0) {
          query = query.where('role', 'in', findOptions.roles);
        }
        break;
      case 'programmingPlanKinds':
        if (
          !isNil(findOptions.programmingPlanKinds) &&
          findOptions.programmingPlanKinds.length > 0
        ) {
          query = query.where(
            sql<boolean>`
              programming_plan_kinds && ${findOptions.programmingPlanKinds}::text[]
            `
          );
        }
        break;
      default:
        assertUnreachable(option);
    }
  }

  const users: User[] = await query.execute();

  return users.map((_: User) => User.parse(_));
};

const insert = async (
  user: Omit<
    KyselyUser,
    'id' | 'loggedSecrets' | 'name' | 'company' | 'companySiret'
  >
): Promise<void> => {
  await kysely.insertInto('users').values(user).execute();
};

const update = async (
  partialUser: Partial<Omit<KyselyUser, 'id' | 'loggedSecrets'>>,
  id: User['id']
): Promise<void> => {
  await kysely
    .updateTable('users')
    .set(partialUser)
    .where('id', '=', id)
    .execute();
};

const addLoggedSecret = async (
  secret: string,
  id: User['id']
): Promise<void> => {
  await kysely
    .updateTable('users')
    .set({ loggedSecrets: sql`logged_secrets || '{"${sql.raw(secret)}"}'` })
    .where('id', '=', id)
    .execute();
};

const deleteLoggedSecret = async (
  secret: string,
  id: User['id']
): Promise<void> => {
  await kysely
    .updateTable('users')
    .set({
      loggedSecrets: sql`array_remove(logged_secrets, '${sql.raw(secret)}')`
    })
    .where('id', '=', id)
    .execute();
};
export const userRepository = {
  findUnique,
  findOne,
  findMany,
  update,
  insert,
  addLoggedSecret,
  deleteLoggedSecret
};
