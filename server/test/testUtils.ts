import jwt from 'jsonwebtoken';
import { Test } from 'supertest';
import { User1 } from '../../database/seeds/test/001-users';
import { TokenPayload, UserApi } from '../models/UserApi';
import config from '../utils/config';

export const accessTokenTest = (payload: TokenPayload) =>
  jwt.sign(payload, config.auth.secret, { expiresIn: 86400 });

export const withAccessToken = (test: Test, user: UserApi = User1) =>
  test.set(
    'x-access-token',
    accessTokenTest({
      userId: user.id,
    })
  );
