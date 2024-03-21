import jwt from 'jsonwebtoken';
import { Plugin } from 'superagent';
import { Test } from 'supertest';
import { TokenPayload, UserApi } from '../models/UserApi';
import config from '../utils/config';

export const accessTokenTest = (payload: TokenPayload) =>
  jwt.sign(payload, config.auth.secret, { expiresIn: 86400 });

export const withAccessToken = (test: Test, user: UserApi) =>
  test.set(
    'x-access-token',
    accessTokenTest({
      userId: user.id,
    })
  );

export const tokenProvider = (user: UserApi): Plugin => {
  return (request) => {
    request.set({
      'x-access-token': accessTokenTest({
        userId: user.id,
      }),
    });
  };
};
