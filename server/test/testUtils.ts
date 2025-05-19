import jwt from 'jsonwebtoken';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { User } from 'maestro-shared/schema/User/User';
import { Plugin } from 'superagent';
import config from '../utils/config';

import { COOKIE_MAESTRO_ACCESS_TOKEN } from '../utils/constants';

export const accessTokenTest = (payload: TokenPayload) =>
  jwt.sign(payload, config.auth.secret, { expiresIn: 86400 });

export const TEST_LOGGED_SECRET = '11111111-1111-1111-1111-111111111111';
export const tokenProvider = (user: User): Plugin => {
  return (request) => {
    request.set(
      'Cookie',
      `${COOKIE_MAESTRO_ACCESS_TOKEN}=${accessTokenTest({
        userId: user.id,
        idToken: 'idToken',
        loggedSecret: TEST_LOGGED_SECRET
      })}`
    );
  };
};
