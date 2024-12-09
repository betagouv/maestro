import { fakerFR } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { genUser, genValidPassword } from '../../../shared/test/userFixtures';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
const { app } = createServer();

describe('Auth routes', () => {
  const user = genUser();

  beforeAll(async () => {
    const hash = await bcrypt.hash(user.password, 10);
    await Users().insert({
      ...user,
      password: hash
    });
  });

  afterAll(async () => {
    await Users().delete().where('email', user.email);
  });

  describe('POST /auth/sign-in', () => {
    const testRoute = '/api/auth/sign-in';

    test('should receive valid email and password', async () => {
      await request(app)
        .post(testRoute)
        .send({
          email: randomstring.generate(),
          password: genValidPassword()
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .post(testRoute)
        .send({
          email: fakerFR.internet.email(),
          password: '   '
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the user is missing', async () => {
      await request(app)
        .post(testRoute)
        .send({
          email: fakerFR.internet.email(),
          password: genValidPassword()
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the password is wrong', async () => {
      await request(app)
        .post(testRoute)
        .send({
          email: user.email,
          password: genValidPassword()
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should succeed if the user is found and the password is correct', async () => {
      const res = await request(app)
        .post(testRoute)
        .send({
          email: user.email,
          password: user.password
        })
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          userId: user.id,
          accessToken: expect.any(String)
        })
      );
    });
  });
});
