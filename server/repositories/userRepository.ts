import { sql } from 'kysely';
import { isNil } from 'lodash-es';
import { FindUserOptions } from 'maestro-shared/schema/User/FindUserOptions';
import { User } from 'maestro-shared/schema/User/User';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import z from 'zod';
import { knexInstance as db } from './db';
import { kysely } from './kysely';

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

  return kysely
    .selectFrom('users')
    .leftJoin('userCompanies', 'users.id', 'userCompanies.userId')
    .leftJoin('companies', 'userCompanies.companySiret', 'companies.siret')
    .where('users.id', '=', userId)
    .select([
      'users.id',
      'users.email',
      'users.name',
      'users.role',
      'users.region',
      'users.department',
      'users.loggedSecrets',
      'users.programmingPlanKinds',
      'users.disabled',
      sql<any>`
        case 
          when count(companies.siret) = 0 then null
          else array_agg(
            json_build_object(
              'siret', companies.siret,
              'name', companies.name,
              'tradeName', companies.trade_name,
              'address' , companies.address,
              'postalCode', companies.postal_code,
              'city', companies.city,
              'nafCode', companies.naf_code,
              'kind', companies.kind,
              'geolocation', case
                when companies.geolocation is not null then
                  json_build_object(
                    'x', companies.geolocation[0],
                    'y', companies.geolocation[1]
                  )
                else null
              end
            )
          ) filter (where companies.siret is not null)
        end
      `.as('companies')
    ])
    .groupBy([
      'users.id',
      'users.email',
      'users.name',
      'users.role',
      'users.region',
      'users.department',
      'users.loggedSecrets',
      'users.programmingPlanKinds'
    ])
    .executeTakeFirst()
    .then((user: (User & { loggedSecrets: string[] }) | undefined) =>
      user
        ? {
            ...User.parse(user),
            loggedSecrets: user.loggedSecrets ?? []
          }
        : undefined
    );
};

const findOne = async (email: string): Promise<User | undefined> => {
  console.log('Find user with email', email);
  const user: Omit<User, 'companies'> | undefined = await kysely
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

  //FIXME load companies ?!
  return User.optional().parse({ ...user, companies: null });
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

  //FIXME load companies !?!
  return users.map((_) => User.parse({ ..._, companies: null }));
};

const insert = async (
  user: Omit<User, 'id' | 'loggedSecrets' | 'name'>
): Promise<void> => {
  const { companies, ...rest } = user;

  await kysely.insertInto('users').values(rest).execute();
};

const update = async (
  partialUser: Partial<Omit<User, 'id' | 'loggedSecrets'>>,
  id: User['id']
): Promise<void> => {
  const { companies, ...rest } = partialUser;
  await kysely.updateTable('users').set(rest).where('id', '=', id).execute();
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
