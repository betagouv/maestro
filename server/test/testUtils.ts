import jwt from 'jsonwebtoken';
import { Plugin } from 'superagent';
import { Test } from 'supertest';
import { TokenPayload } from '../../shared/schema/User/TokenPayload';
import { User } from '../../shared/schema/User/User';
import config from '../utils/config';

export const accessTokenTest = (payload: TokenPayload) =>
  jwt.sign(payload, config.auth.secret, { expiresIn: 86400 });

export const withAccessToken = (test: Test, user: User) =>
  test.set(
    'x-access-token',
    accessTokenTest({
      userId: user.id,
    })
  );

export const tokenProvider = (user: User): Plugin => {
  return (request) => {
    request.set({
      'x-access-token': accessTokenTest({
        userId: user.id,
      }),
    });
  };
};
