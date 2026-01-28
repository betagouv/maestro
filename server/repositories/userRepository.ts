import { Expression, ExpressionBuilder, sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { isNil } from 'lodash-es';
import { FindUserOptions } from 'maestro-shared/schema/User/FindUserOptions';
import { UserRefined } from 'maestro-shared/schema/User/User';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { toArray } from 'maestro-shared/utils/utils';
import z from 'zod';
import { knexInstance as db } from './db';
import { executeTransaction, kysely } from './kysely';
import { DB, toSqlArray } from './kysely.type';

export const usersTable = 'users';

const userCompaniesTable = 'user_companies';

export const Users = () => db<UserRefined>(usersTable);

const UserCompany = z.object({
  userId: z.guid(),
  companySiret: z.string()
});

type UserCompany = z.infer<typeof UserCompany>;

export const UserCompanies = () => db<UserCompany>(userCompaniesTable);

const findUnique = async (
  userId: string
): Promise<(UserRefined & { loggedSecrets: string[] }) | undefined> => {
  console.log('Get User with id', userId);

  return kysely
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .select((eb) => [companies(eb.ref('users.id'), eb).as('companies')])
    .executeTakeFirst();
};

const findOne = async (email: string): Promise<UserRefined | undefined> => {
  console.log('Find user with email', email.toLowerCase());
  return kysely
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email.toLowerCase())
    .select((eb) => [companies(eb.ref('users.id'), eb).as('companies')])
    .executeTakeFirst();
};

const companies = (
  userId: Expression<string>,
  db: ExpressionBuilder<DB, 'users'>
) => {
  return jsonArrayFrom(
    db
      .selectFrom('companies')
      .leftJoin(
        'userCompanies',
        'companies.siret',
        'userCompanies.companySiret'
      )
      .selectAll('companies')
      .whereRef('userCompanies.userId', '=', userId)
  );
};

const findMany = async (
  findOptions: FindUserOptions
): Promise<UserRefined[]> => {
  console.log('Find users', findOptions);
  let query = kysely
    .selectFrom('users')
    .selectAll()
    .select((eb) => [companies(eb.ref('users.id'), eb).as('companies')])
    .orderBy('name');

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
          query = query.where('roles', '&&', toSqlArray(findOptions.roles));
        }
        break;
      case 'programmingPlanKinds':
        if (
          !isNil(findOptions.programmingPlanKinds) &&
          findOptions.programmingPlanKinds.length > 0
        ) {
          query = query.where(
            'programmingPlanKinds',
            '&&',
            toSqlArray(toArray(findOptions.programmingPlanKinds) ?? [])
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

  console.log('Executing user findMany query:', query.compile().sql);

  const users: UserRefined[] = await query.execute();

  return users.map((u) => UserRefined.parse(u));
};

const insert = async (
  user: Omit<UserRefined, 'id' | 'loggedSecrets' | 'name'>
): Promise<void> => {
  const { companies, ...rest } = user;
  const newUser = { ...rest, email: rest.email.toLowerCase() };

  await executeTransaction(async (trx) => {
    const result = await trx
      .insertInto('users')
      .values(newUser)
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
  partialUser: Partial<Omit<UserRefined, 'id' | 'loggedSecrets'>>,
  id: UserRefined['id']
): Promise<void> => {
  const { companies, ...rest } = partialUser;

  await executeTransaction(async (trx) => {
    if (companies !== undefined) {
      await trx.deleteFrom('userCompanies').where('userId', '=', id).execute();
      if (companies && companies.length > 0) {
        await trx
          .insertInto('userCompanies')
          .values(companies.map((c) => ({ userId: id, companySiret: c.siret })))
          .execute();
      }
    }
    if (Object.keys(rest).length) {
      await trx
        .updateTable('users')
        .set({ ...rest, email: rest.email?.toLowerCase() })
        .where('id', '=', id)
        .execute();
    }
  });
};

const addLoggedSecret = async (
  secret: string,
  id: UserRefined['id']
): Promise<void> => {
  await kysely
    .updateTable('users')
    .set({ loggedSecrets: sql`logged_secrets || '{"${sql.raw(secret)}"}'` })
    .where('id', '=', id)
    .execute();
};

const deleteLoggedSecret = async (
  secret: string,
  id: UserRefined['id']
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
