import jwt from 'jsonwebtoken';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { User } from 'maestro-shared/schema/User/User';
import { Plugin } from 'superagent';
import config from '../utils/config';
import { COOKIE_MAESTRO_ACCESS_TOKEN } from '../controllers/authController';

export const accessTokenTest = (payload: TokenPayload) =>
  jwt.sign(payload, config.auth.secret, { expiresIn: 86400 });

export const tokenProvider = (user: User): Plugin => {
  return (request) => {
   request.set('Cookie', `${COOKIE_MAESTRO_ACCESS_TOKEN}=${accessTokenTest({
        userId: user.id,
        idToken: 'idToken'
    })}`)
  };
};
