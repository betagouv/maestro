import jwt from 'jsonwebtoken';
import { TokenPayload, UserApi } from '../models/UserApi';
import { Test } from 'supertest';
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
