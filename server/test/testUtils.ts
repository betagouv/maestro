import jwt from 'jsonwebtoken';
import {
  COOKIE_MAESTRO_ACCESS_TOKEN,
  COOKIE_MAESTRO_USER_ROLE
} from 'maestro-shared/constants';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { UserRefined } from 'maestro-shared/schema/User/User';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
import { Plugin } from 'superagent';
import config from '../utils/config';

export const accessTokenTest = (payload: TokenPayload) =>
  jwt.sign(payload, config.auth.secret, { expiresIn: 86400 });

export const TEST_LOGGED_SECRET = '11111111-1111-1111-1111-111111111111';
export const tokenProvider = (
  user: UserRefined,
  userRole?: UserRole
): Plugin => {
  return (request) => {
    request.set(
      'Cookie',
      `${COOKIE_MAESTRO_ACCESS_TOKEN}=${accessTokenTest({
        userId: user.id,
        idToken: 'idToken',
        loggedSecret: TEST_LOGGED_SECRET
      })}; ${COOKIE_MAESTRO_USER_ROLE}=${userRole ?? user.roles[0]}`
    );
  };
};
