import { sql } from 'kysely';
import { isNil } from 'lodash-es';
import { FindUserOptions } from 'maestro-shared/schema/User/FindUserOptions';
import { User } from 'maestro-shared/schema/User/User';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import z from 'zod';
import { knexInstance as db } from './db';
import { executeTransaction, kysely } from './kysely';

export const usersTable = 'users';

const userCompaniesTable = 'user_companies';

export const Users = () => db<User>(usersTable);

const UserCompany = z.object({
  userId: z.guid(),
  companySiret: z.string()
});

type UserCompany = z.infer<typeof UserCompany>;

export const UserCompanies = () => db<UserCompany>(userCompaniesTable);

const findUnique = async (
  userId: string
): Promise<(User & { loggedSecrets: string[] }) | undefined> => {
  console.log('Get User with id', userId);

  const user = await kysely
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirst();

  if (!user) {
    return undefined;
  }

  const companies = await getCompaniesByUserId(userId);

  return { ...user, companies };
};

const findOne = async (email: string): Promise<User | undefined> => {
  console.log('Find user with email', email);
  const user: Omit<User, 'companies'> | undefined = await kysely
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

  if (user) {
    const companies = await getCompaniesByUserId(user.id);
    return { ...user, companies };
  }

  return undefined;
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
      case 'disabled':
        if (findOptions.disabled === false || findOptions.disabled === true) {
          query = query.where('disabled', 'is', findOptions.disabled);
        }
        break;
      default:
        assertUnreachable(option);
    }
  }

  const users: Omit<User, 'companies'>[] = await query.execute();

  return users.map((_) => User.parse({ ..._, companies: null }));
};

const insert = async (
  user: Omit<User, 'id' | 'loggedSecrets' | 'name'>
): Promise<void> => {
  const { companies, ...rest } = user;

  await executeTransaction(async (trx) => {
    const result = await trx
      .insertInto('users')
      .values(rest)
      .returning('id')
      .executeTakeFirst();

    if (result && companies && companies.length > 0) {
      await trx
        .insertInto('userCompanies')
        .values(
          companies.map((c) => ({ userId: result.id, companySiret: c.siret }))
        )
        .execute();
    }
  });
};

const update = async (
  partialUser: Partial<Omit<User, 'id' | 'loggedSecrets'>>,
  id: User['id']
): Promise<void> => {
  const { companies, ...rest } = partialUser;

  await executeTransaction(async (trx) => {
    await trx.deleteFrom('userCompanies').where('userId', '=', id).execute();
    if (companies && companies.length > 0) {
      await trx
        .insertInto('userCompanies')
        .values(companies.map((c) => ({ userId: id, companySiret: c.siret })))
        .execute();
    }
    if (Object.keys(rest).length) {
      await trx.updateTable('users').set(rest).where('id', '=', id).execute();
    }
  });
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

const getCompaniesByUserId = async (userId: string) => {
  return kysely
    .selectFrom('companies')
    .leftJoin('userCompanies', 'companies.siret', 'userCompanies.companySiret')
    .selectAll('companies')
    .where('userCompanies.userId', '=', userId)
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
