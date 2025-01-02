import { fakerFR } from '@faker-js/faker';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { RegionList } from '../referential/Region';
import { AuthUser } from '../schema/User/AuthUser';
import { User } from '../schema/User/User';
import { UserRoleList } from '../schema/User/UserRole';
import { oneOf } from './testFixtures';

export const genValidPassword = () => '123Valid';

export const genUser = (data?: Partial<User>): User => {
  const roles = data?.roles ?? [oneOf(UserRoleList)];
  return {
    id: uuidv4(),
    email: fakerFR.internet.email(),
    password: randomstring.generate(),
    firstName: fakerFR.person.firstName(),
    lastName: fakerFR.person.lastName(),
    roles,
    region:
      roles?.includes('NationalCoordinator') || roles?.includes('Administrator')
        ? null
        : oneOf(RegionList),
    ...data
  };
};

export function genAuthUser(): AuthUser {
  return {
    accessToken: randomstring.generate(),
    userId: uuidv4()
  };
}
